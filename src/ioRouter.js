import createDebug from 'debug';
import jwt from 'jsonwebtoken';
import createGrpcClient from 'sw-grpc-client';
import { difference } from 'lodash';
import createGzh from 'sw-weixin-gzh';
import {
  jwtSecret,
  jwtoken,
  wechatGZHConfig,
  wechatConfig,
  grpcFunds as fundsDB,
} from './config';

const debug = createDebug('ioRouter');
const gzh = createGzh(wechatGZHConfig);

let globalPrevMarketsRooms;

const smartwinMd = createGrpcClient({
  serviceName: 'smartwinFuturesMd',
  server: {
    ip: 'invesmart.win',
    port: '50052',
  },
  jwtoken,
});

export default function ioRouter(io) {
  io.use((socket, next) => {
    const Namespace = Object.getPrototypeOf(socket.server.sockets).constructor;
    Namespace.events.push('authenticated');
    return next();
  });
  io.on('connection', (socket) => {
    debug('%o connected to SOCKET', socket.id);

    socket.on('getQRCodeURL', async (data, callback) => {
      try {
        const redirectURI = `https://api.invesmart.net/api/public/auth/wechat\
&response_type=code\
&scope=snsapi_base\
&state=${socket.id}`;

        const longURL = `https://open.weixin.qq.com/connect/oauth2/authorize?\
appid=${wechatConfig.corpId}\
&redirect_uri=${redirectURI}#wechat_redirect`;

        const qrCodeURL = await gzh.getShortURL(longURL);

        if (callback) callback({ ok: true, qrCodeURL });
      } catch (error) {
        debug('getQRCodeURL Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('setToken', async (data, callback) => {
      try {
        jwt.verify(data.token, jwtSecret, (error, decodedToken) => {
          try {
            if (error) throw new Error('cannot verify the jwt token');
            debug('decodedToken %o', decodedToken);
            debug('socket.id %o', socket.id);

            const serverNsps = Object.keys(socket.server.nsps);
            debug('serverNsps %o', serverNsps);

            const clientNsps = Object.keys(socket.client.nsps);
            debug('clientNsps %o', clientNsps);

            const clientSockets = Object.keys(socket.client.sockets);
            debug('clientSockets %o', clientSockets);

            for (const clientSocketID of clientSockets) {
              socket.client.sockets[clientSocketID].token = decodedToken;
              socket.client.sockets[clientSocketID].nsp.emit('authenticated', socket.client.sockets[clientSocketID]);
            }

            if (callback) callback({ ok: true });
          } catch (err) {
            debug('Error jwt.verify() %o', err);
            if (callback) callback({ ok: false, err: err.message });
          }
        });
      } catch (error) {
        debug('setToken Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });
  })
  .on('authenticated', (socket) => {
    debug('authenticated Socket.IO: %o', socket.token);
  })
  ;

  const marketsIO = io.of('/markets');

  const tickerStream = smartwinMd.getTickerStream();
  tickerStream
    .on('data', (data) => {
      marketsIO.to(data.symbol.concat(':', data.dataType)).emit('tick', data);
    })
    .on('error', error => debug('Error tickerStream %o', error))
    ;

  marketsIO.on('connection', (socket) => {
    debug('%o connected to Market.IO', socket.id);
  })
  .on('authenticated', (socket) => {
    debug('authenticated Markets.IO: %o', socket.token);

    socket.on('subscribe', async (data, callback) => {
      try {
        debug('Markets.IO subscribed to %o with callback: %o', data, !!callback);
        if (!data.symbol) throw new Error('Missing fundid parameter');
        if (!data.resolution) throw new Error('Missing resolution parameter');

        await smartwinMd.subscribeMarketData({
          symbol: data.symbol,
          resolution: 'snapshot',
          dataType: 'ticker',
        });

        socket.join(
          data.symbol.concat(':', 'ticker'),
          (error) => {
            if (error) throw error;
            if (callback) callback({ ok: true });
          }
        );
      } catch (error) {
        debug('marketsIO.on(subscribe) Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('unsubscribe', async (data, callback) => {
      try {
        debug('Markets.IO unsubscribed to %o with callback: %o', data, !!callback);
        if (!data.symbol) throw new Error('Missing fundid parameter');
        if (!data.resolution) throw new Error('Missing resolution parameter');

        const prevMarketsRooms = Object.keys(marketsIO.adapter.rooms);
        debug('prevMarketsRooms %o', prevMarketsRooms);

        if (data.symbol === 'all') {
          const socketRooms = Object.keys(socket.rooms);
          debug('Markets.IO all socket socketRooms: %o', socketRooms);

          const leaveAllRooms = socketRooms
            .filter(room => !room.includes('/markets#'))
            .map((room) => {
              debug('leaving room %o', room);
              return new Promise((resolve, reject) => {
                socket.leave(room, (error) => {
                  if (error) reject(error);
                  resolve();
                });
              });
            });
          await Promise.all(leaveAllRooms);

          if (callback) callback({ ok: true });
        } else {
          socket.leave(data.symbol, (error) => {
            if (error) throw error;
            if (callback) callback({ ok: true });
          });
        }

        const newMarketsRooms = Object.keys(marketsIO.adapter.rooms);
        debug('newMarketsRooms %o', newMarketsRooms);

        const removedMarketsRooms = difference(prevMarketsRooms, newMarketsRooms);
        debug('removedMarketsRooms %o', removedMarketsRooms);

        for (const removedRoom of removedMarketsRooms) {
          const instrument = removedRoom.split(':');
          smartwinMd.unsubscribeMarketData({
            symbol: instrument[0],
            resolution: 'snapshot',
            dataType: 'ticker',
          });
        }
      } catch (error) {
        debug('marketsIO.on(unsubscribe) Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('disconnecting', () => {
      try {
        debug('disconnecting %o', socket.id);
        globalPrevMarketsRooms = Object.keys(marketsIO.adapter.rooms).filter(room => !room.includes('/markets#'));
        debug('globalPrevMarketsRooms %o', globalPrevMarketsRooms);
      } catch (error) {
        debug('marketsIO.on(disconnect) Error: %o', error);
      }
    });


    socket.on('disconnect', () => {
      try {
        debug('%o disconnected', socket.id);
        const newMarketsRooms = Object.keys(marketsIO.adapter.rooms).filter(room => !room.includes('/markets#'));
        debug('newMarketsRooms %o', newMarketsRooms);

        const removedMarketsRooms = difference(globalPrevMarketsRooms, newMarketsRooms);
        debug('removedMarketsRooms %o', removedMarketsRooms);

        for (const removedRoom of removedMarketsRooms) {
          const instrument = removedRoom.split(':');
          smartwinMd.unsubscribeMarketData({
            symbol: instrument[0],
            resolution: 'snapshot',
            dataType: 'ticker',
          });
        }
      } catch (error) {
        debug('marketsIO.on(disconnect) Error: %o', error);
      }
    });
  })
  ;

  const fundsIO = io.of('/funds');
  fundsIO.on('connection', (socket) => {
    debug('%o connected to Funds.IO', socket.id);
  })
  .on('authenticated', (socket) => {
    debug('authenticated Funds.IO: %o', socket.token);

    socket.on('subscribe', async (data, callback) => {
      try {
        debug('Funds.IO subscribed to %o with callback: %o', data, !!callback);
        if (!data.fundid) throw new Error('Missing fundid parameter');

        const fundConf = fundsDB.find(fund => fund.fundid === data.fundid);
        if (fundConf === undefined) throw new Error('The fund %o is not in apiGateway config', data.fundid);

        const smartwinFund = createGrpcClient(fundConf);

        const eventNames = ['order', 'trade', 'account', 'positions'];

        socket.join(
          data.fundid,
          (error) => {
            try {
              if (error) throw error;

              const theFundStreams = smartwinFund.getAllStreams();
              const theFundRegisteredEvents = theFundStreams.eventNames();

              if (!theFundRegisteredEvents.includes('error')) {
                theFundStreams.on('error', (eventError) => {
                  debug('eventError %o', eventError);
                });
              }

              const needRegisterEvents = difference(eventNames, theFundRegisteredEvents);
              debug('needRegisterEvents %o', needRegisterEvents);
              for (const eventName of needRegisterEvents) {
                theFundStreams.on(eventName, (eventData) => {
                  fundsIO.to(data.fundid).emit(eventName, eventData);
                });
              }

              if (callback) callback({ ok: true });
            } catch (err) {
              debug('fundsIO.on(subscribe) Error: %o', err);
              if (callback) callback({ ok: false, error: err.message });
            }
          }
        );
      } catch (error) {
        debug('fundsIO.on(subscribe) Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('unsubscribe', async (data, callback) => {
      try {
        debug('Funds.IO unsubscribed to %o with callback: %o', data, !!callback);
        if (!data.fundid) throw new Error('Missing fundid parameter');

        const prevFundsRooms = Object.keys(fundsIO.adapter.rooms);
        debug('prevFundsRooms %o', prevFundsRooms);

        if (data.fundid === 'all') {
          const rooms = Object.keys(socket.rooms);
          debug('Funds.IO all socket rooms: %o', rooms);

          const leaveAllRooms = rooms
            .filter(room => !room.includes('/funds#'))
            .map((room) => {
              debug('leaving room %o', room);
              return new Promise((resolve, reject) => {
                socket.leave(room, (error) => {
                  if (error) reject(error);
                  resolve();
                });
              });
            });
          await Promise.all(leaveAllRooms);

          if (callback) callback({ ok: true });
        } else {
          socket.leave(
            data.fundid,
            (error) => {
              if (error) throw error;
              if (callback) callback({ ok: true });
            }
          );
        }

        const newFundsRooms = Object.keys(fundsIO.adapter.rooms);
        debug('newFundsRooms %o', newFundsRooms);

        const removedFundsRooms = difference(prevFundsRooms, newFundsRooms);
        debug('removedFundsRooms %o', removedFundsRooms);

        for (const fundid of removedFundsRooms) {
          debug('nobody in room %o', fundid);
        }
      } catch (error) {
        debug('fundsIO.on(unsubscribe) Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });
  })
  ;
}
