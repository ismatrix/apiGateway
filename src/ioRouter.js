import createDebug from 'debug';
// import through from 'through2';
import jwt from 'jsonwebtoken';
import createGrpcClient from 'sw-grpc-client';
import { difference } from 'lodash';
// import iceLive from 'sw-datafeed-icelive';
// import createIceBroker from 'sw-broker-ice';
import createGzh from 'sw-weixin-gzh';
import {
  jwtSecret,
  jwtoken,
  wechatGZHConfig,
  wechatConfig,
  // funds as fundsDB,
  grpcFunds as fundsDB,
} from './config';

const debug = createDebug('ioRouter');
const gzh = createGzh(wechatGZHConfig);

const smartwinMd = createGrpcClient({
  serviceName: 'smartwinFuturesMd',
  server: {
    ip: 'invesmart.win',
    port: '50052',
  },
  jwtoken,
});

const fundsRegisteredEvents = {};

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
          if (error) throw error;
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
        // await iceLive.subscribe(data.symbol, data.resolution);

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
        debug('Markets.IO subscribed to %o with callback: %o', data, !!callback);
        if (!data.symbol) throw new Error('Missing fundid parameter');
        if (!data.resolution) throw new Error('Missing resolution parameter');

        const oldMarketsRooms = Object.keys(marketsIO.adapter.rooms);
        debug('oldMarketsRooms %o', oldMarketsRooms);

        if (data.symbol === 'all') {
          const rooms = Object.keys(socket.rooms);
          debug('Markets.IO all socket rooms: %o', rooms);

          const leaveAllRooms = rooms
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

        const removedMarketsRooms = difference(oldMarketsRooms, newMarketsRooms);
        debug('removedMarketsRooms %o', removedMarketsRooms);

        removedMarketsRooms.map((removedRoom) => {
          const instrument = removedRoom.split(':');
          return smartwinMd.unsubscribeMarketData({
            symbol: instrument[0],
            resolution: 'snapshot',
            dataType: 'ticker',
          });
          // return iceLive.unsubscribe(instrument[0], instrument[1]);
        });
      } catch (error) {
        debug('marketsIO.on(unsubscribe) Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
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
        debug('fundConf %o', fundConf);
        const smartwinFund = createGrpcClient(fundConf);

        // const iceBroker = createIceBroker(fundConf);

        const eventNames = ['order', 'trade', 'account', 'positions'];

        socket.join(
          data.fundid,
          (error) => {
            try {
              if (error) throw error;

              let needRegisterEvents;
              if (data.fundid in fundsRegisteredEvents) {
                needRegisterEvents = difference(
                  eventNames, fundsRegisteredEvents[data.fundid]);
              } else {
                fundsRegisteredEvents[data.fundid] = [];
                needRegisterEvents = eventNames;
              }

              debug('needRegisterEvents %o', needRegisterEvents);
              for (const eventName of needRegisterEvents) {
                // iceBroker.on(eventName, (eventData) => {
                //   fundsIO.to(data.fundid).emit(eventName, eventData);
                // });
                const allFundEvents = smartwinFund.getAllStreams();
                if (!allFundEvents.eventNames().includes('error')) {
                  allFundEvents.on('error', eventError => debug('eventError %o', eventError));
                }
                allFundEvents
                  .on(eventName, (eventData) => {
                    fundsIO.to(data.fundid).emit(eventName, eventData);
                  })
                  ;

                fundsRegisteredEvents[data.fundid].push(eventName);
              }

              debug('fundsRegisteredEvents[data.fundid] %o', fundsRegisteredEvents[data.fundid]);
              // debug('iceBroker.eventNames() %o', iceBroker.eventNames());
              // debug('smartwinFund.eventNames() %o', allFundEvents.eventNames());
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

        const oldFundsRooms = Object.keys(fundsIO.adapter.rooms);
        debug('oldFundsRooms %o', oldFundsRooms);

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

        const removedFundsRooms = difference(oldFundsRooms, newFundsRooms);
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

  // const marketsSocket = through.obj(
  //   (chunk, enc, callback) => {
  //     marketsIO.to(chunk.symbol.concat(':', chunk.resolution)).emit(chunk.resolution, chunk);
  //     callback();
  //   }
  // );
  // const iceLiveStream = iceLive.getDataFeed();
  // iceLiveStream.pipe(marketsSocket);

  const tickerStream = smartwinMd.getTickerStream();
  tickerStream
    .on('data', data => marketsIO.to(data.symbol.concat(':', data.resolution)).emit('tick', data))
    .on('error', error => debug('error %o', error))
    ;
}
