import createDebug from 'debug';
import jwt from 'jsonwebtoken';
import createGrpcClient from 'sw-grpc-client';
import { difference, upperFirst, isString } from 'lodash';
import createGzh from 'sw-weixin-gzh';
import can from 'sw-can';
import config from './config';

const debug = createDebug('app:ioRouter');
const logError = createDebug('app:ioRouter:error');
logError.log = console.error.bind(console);

const gzh = createGzh(config.wechatGZHConfig);

let globalPrevMarketsRooms;
let globalPrevFundsRooms;
const fundsRegisteredEvents = [];
const BASICS = 'basics';
const ALL = 'all';

const smartwinMd = createGrpcClient({
  serviceName: 'smartwinFuturesMd',
  server: {
    ip: 'markets.invesmart.net',
    port: '50052',
  },
  jwtoken: config.jwtoken,
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
        const redirectURI = `https://invesmart.net/api/public/auth/wechat\
&response_type=code\
&scope=snsapi_base\
&state=${socket.id}`;

        const longURL = `https://open.weixin.qq.com/connect/oauth2/authorize?\
appid=${config.wechatConfig.corpId}\
&redirect_uri=${redirectURI}#wechat_redirect`;

        const qrCodeURL = await gzh.getShortURL(longURL);

        if (callback) callback({ ok: true, qrCodeURL });
      } catch (error) {
        logError('getQRCodeURL(): %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('setToken', async (data, callback) => {
      try {
        jwt.verify(data.token, config.jwtSecret, (error, decodedToken) => {
          try {
            if (error) {
              logError('jwt.verify() cb %o', error);
              throw new Error('cannot verify the jwt token');
            }
            debug('decodedToken %o', decodedToken);
            debug('socket.id %o', socket.id);

            const serverNsps = Object.keys(socket.server.nsps);
            debug('serverNsps %o', serverNsps);

            const clientNsps = Object.keys(socket.client.nsps);
            debug('clientNsps %o', clientNsps);

            const clientSockets = Object.keys(socket.client.sockets);
            debug('clientSockets %o', clientSockets);

            for (const clientSocketID of clientSockets) {
              socket.client.sockets[clientSocketID].state.token = data.token;
              socket.client.sockets[clientSocketID].state.user = decodedToken;
              socket.client.sockets[clientSocketID].nsp.emit('authenticated', socket.client.sockets[clientSocketID]);
            }

            if (callback) callback({ ok: true });
          } catch (err) {
            logError('jwt.verify(): %o', err);
            if (callback) callback({ ok: false, err: err.message });
          }
        });
      } catch (error) {
        logError('setToken(): %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });
  })
  .on('authenticated', (socket) => {
    debug('authenticated Socket.IO: %o', socket.state.user);
  })
  ;

  const marketsIO = io.of('/markets');

  smartwinMd.getStreams('ticker').on('ticker', (ticker) => {
    marketsIO.to(ticker.symbol.concat(':', ticker.dataType)).emit('tick', ticker);
  });

  marketsIO.on('connection', (socket) => {
    debug('%o connected to Market.IO', socket.id);
  })
  .on('authenticated', (socket) => {
    debug('authenticated Markets.IO: %o', socket.state.user);

    socket.on('subscribe', async (data, callback) => {
      try {
        await can.koa(socket, 'get', 'fundid:all/basics');
        debug('Markets.IO subscribed to %o with callback: %o', data, !!callback);
        if (!data.symbol) throw new Error('Missing symbol parameter');
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
        logError('marketsIO.on(subscribe): %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('unsubscribe', async (data, callback) => {
      try {
        await can.koa(socket, 'get', 'fundid:all/basics');
        debug('Markets.IO unsubscribed to %o with callback: %o', data, !!callback);
        if (!data.symbol) throw new Error('Missing fundid parameter');
        if (!data.resolution) throw new Error('Missing resolution parameter');

        const prevMarketsRooms = Object.keys(marketsIO.adapter.rooms);
        debug('prevMarketsRooms %o', prevMarketsRooms);

        if (data.symbol === ALL) {
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
          const [symbol] = removedRoom.split(':');
          smartwinMd.unsubscribeMarketData({
            symbol,
            resolution: 'snapshot',
            dataType: 'ticker',
          });
        }
      } catch (error) {
        logError('marketsIO.on(unsubscribe): %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('disconnecting', () => {
      try {
        debug('disconnecting %o', socket.id);
        globalPrevMarketsRooms = Object.keys(marketsIO.adapter.rooms).filter(room => !room.includes('/markets#'));
        debug('globalPrevMarketsRooms %o', globalPrevMarketsRooms);
      } catch (error) {
        logError('marketsIO.on(disconnecting): %o', error);
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
          const [symbol] = removedRoom.split(':');
          smartwinMd.unsubscribeMarketData({
            symbol,
            resolution: 'snapshot',
            dataType: 'ticker',
          });
        }
      } catch (error) {
        logError('marketsIO.on(disconnect): %o', error);
      }
    });
  })
  ;

  const basicEventNames = ['order', 'trade', 'account', 'positions', 'tradingday'];
  const extraEventNames = ['combinedReport', 'liveAccount', 'livePositions'];

  const unregisterEmptyRoom = (previousRoomsSnapshot, currentRoomsSnapshot) => {
    const removedFundsRooms = difference(previousRoomsSnapshot, currentRoomsSnapshot);
    debug('removedFundsRooms %o', removedFundsRooms);

    for (const removedRoom of removedFundsRooms) {
      const needUnregisterEventIndex =
        fundsRegisteredEvents.findIndex(obj => obj.roomName === removedRoom);

      if (needUnregisterEventIndex !== -1) {
        debug('needUnregisterEventIndex %o: %o', removedRoom, needUnregisterEventIndex);
        clearInterval(fundsRegisteredEvents[needUnregisterEventIndex].recursiveCall.stop());

        const removedFundsEvent = fundsRegisteredEvents.splice(needUnregisterEventIndex, 1);
        debug('removedFundsEvent %o', removedFundsEvent);
      }
    }
  };

  const fundsIO = io.of('/funds');
  fundsIO.on('connection', (socket) => {
    debug('%o connected to Funds.IO', socket.id);
  })
  .on('authenticated', (socket) => {
    debug('authenticated Funds.IO: %o', socket.state.user);

    socket.on('subscribe', async (data, callback) => {
      try {
        await can.koa(socket, 'get', 'fundid:all/basics');
        debug('Funds.IO subscribed to %o with callback: %o', data, !!callback);
        if (!data) throw new Error('Missing main data object');
        if (!isString(data.fundid)) throw new Error('Missing fundid parameter or not a string');
        if (!isString(data.eventName)) throw new Error('Missing eventName parameter or not a string');

        if (!extraEventNames.includes(data.eventName) && data.eventName !== BASICS) throw new Error(`The eventName "${data.eventName}" does not exist`);

        const fundConf = config.fundConfigs.find(fund => fund.fundid === data.fundid);
        if (fundConf === undefined) throw new Error(`The fund ${data.fundid} does not exist`);

        const smartwinFund = createGrpcClient(fundConf);

        if (data.eventName === BASICS) {
          const roomName = `${data.fundid}:${BASICS}`;
          socket.join(
            roomName,
            (error) => {
              try {
                if (error) throw error;

                const theFundStreams = smartwinFund.getAllStreams();
                const theFundRegisteredEvents = theFundStreams.eventNames();

                const needRegisterEvents = difference(basicEventNames, theFundRegisteredEvents);
                debug('need add listener on these basic events %o', needRegisterEvents);

                for (const eventName of needRegisterEvents) {
                  theFundStreams.on(eventName, (eventData) => {
                    fundsIO.to(roomName).emit(eventName, eventData);
                  });
                }

                if (callback) callback({ ok: true });
              } catch (err) {
                logError('fundsIO.on(subscribe): %o', err);
                if (callback) callback({ ok: false, error: err.message });
              }
            }
          );
        } else if (extraEventNames.includes(data.eventName)) {
          const roomName = `${data.fundid}:${data.eventName}`;
          socket.join(
            roomName,
            (error) => {
              try {
                if (error) throw error;

                const isNeedRegisterGetAndEmitOnInterval = !fundsRegisteredEvents
                  .map(obj => obj.roomName)
                  .includes(roomName);
                debug('isNeedRegister %o: %o', roomName, isNeedRegisterGetAndEmitOnInterval);

                if (isNeedRegisterGetAndEmitOnInterval) {
                  const getAndEmitFunction = async () => {
                    try {
                      const functionName = 'get'.concat(upperFirst(data.eventName));
                      const dataFromGet = await smartwinFund[functionName]();
                      fundsIO.to(roomName).emit(data.eventName, dataFromGet);
                    } catch (err) {
                      logError('getAndEmitFunction(): roomName: %o, %o', roomName, err);
                      fundsIO.to(roomName).emit(data.eventName, { ok: false, error: `${data.fundid}: ${err.message}` });
                    }
                  };
                  const makeRecursiveCall = (funcToCall, timeout) => {
                    let stopped = false;
                    const start = async () => {
                      await funcToCall();
                      await new Promise(r => setTimeout(r, timeout));
                      if (!stopped) start();
                    };
                    const stop = () => { stopped = true; };
                    return { start, stop };
                  };
                  const recursiveCall = makeRecursiveCall(getAndEmitFunction, 5000);

                  recursiveCall.start();
                  fundsRegisteredEvents.push({
                    roomName,
                    recursiveCall,
                  });
                  debug('number of getAndEmit functions', fundsRegisteredEvents.length);
                }

                if (callback) callback({ ok: true });
              } catch (err) {
                logError('fundsIO.on(subscribe): %o', err);
                if (callback) callback({ ok: false, error: err.message });
              }
            }
          );
        }
      } catch (error) {
        logError('fundsIO.on(subscribe): %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('unsubscribe', async (data, callback) => {
      try {
        await can.koa(socket, 'get', 'fundid:all/basics');
        debug('Funds.IO unsubscribed to %o with callback: %o', data, !!callback);
        if (!data) throw new Error('Missing main data object');
        if (!isString(data.fundid)) throw new Error('Missing fundid parameter or not a string');
        if (!isString(data.eventName)) throw new Error('Missing eventName parameter or not a string');

        if (!extraEventNames.includes(data.eventName) && data.eventName !== BASICS) throw new Error(`The eventName "${data.eventName}" does not exist`);

        if (data.fundid !== ALL) {
          const fundConf = config.fundConfigs.find(fund => fund.fundid === data.fundid);
          if (fundConf === undefined) throw new Error(`The fund ${data.fundid} does not exist`);
        }

        const prevFundsRooms = Object.keys(fundsIO.adapter.rooms);
        debug('prevFundsRooms %o', prevFundsRooms);

        if (data.fundid === ALL) {
          const rooms = Object.keys(socket.rooms);
          debug('Funds.IO all socket rooms: %o', rooms);

          const leaveAllRooms = rooms
            .filter(room => !room.includes('/funds#'))
            .map((room) => {
              if (room.includes(data.eventName)) {
                debug('leaving room %o', room);
                return new Promise((resolve, reject) => {
                  socket.leave(room, (error) => {
                    if (error) reject(error);
                    resolve();
                  });
                });
              }
              return 'no need to leave this room';
            });
          await Promise.all(leaveAllRooms);

          if (callback) callback({ ok: true });
        } else if (data.eventName === BASICS) {
          const roomName = `${data.fundid}:${BASICS}`;
          socket.leave(
            roomName,
            (error) => {
              if (error) throw error;
              if (callback) callback({ ok: true });
            }
          );
        } else if (extraEventNames.includes(data.eventName)) {
          const roomName = `${data.fundid}:${data.eventName}`;
          socket.leave(
            roomName,
            (error) => {
              if (error) throw error;
              if (callback) callback({ ok: true });
            }
          );
        }

        const newFundsRooms = Object.keys(fundsIO.adapter.rooms);
        debug('newFundsRooms %o', newFundsRooms);

        unregisterEmptyRoom(prevFundsRooms, newFundsRooms);
      } catch (error) {
        logError('fundsIO.on(unsubscribe): %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('disconnecting', () => {
      try {
        debug('disconnecting %o', socket.id);
        globalPrevFundsRooms = Object.keys(fundsIO.adapter.rooms).filter(room => !room.includes('/funds#'));
        debug('globalPrevFundsRooms %o', globalPrevFundsRooms);
      } catch (error) {
        logError('fundsIO.on(disconnecting): %o', error);
      }
    });


    socket.on('disconnect', () => {
      try {
        debug('%o disconnected', socket.id);
        const newFundsRooms = Object.keys(fundsIO.adapter.rooms).filter(room => !room.includes('/funds#'));
        debug('newFundsRooms %o', newFundsRooms);

        unregisterEmptyRoom(globalPrevFundsRooms, newFundsRooms);
      } catch (error) {
        logError('marketsIO.on(disconnect): %o', error);
      }
    });
  })
  ;
}
