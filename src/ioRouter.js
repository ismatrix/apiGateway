import logger from 'sw-common';
import jwt from 'jsonwebtoken';
import createGrpcClient from 'sw-grpc-client';
import { difference, upperFirst, isString } from 'lodash';
import createGzh from 'sw-weixin-gzh';
import config from './config';

// 负责路由ｗｅｂｓｏｃｋｅｔ
const gzh = createGzh(config.wechatGZHConfig);

let globalPrevMarketsRooms;
let globalPrevFundsRooms;
const fundsRegisteredEvents = [];
const BASICS = 'basics';
const ALL = 'all';

const smartwinMd = createGrpcClient({
  serviceName: 'smartwinFuturesMd',
  server: {
    ip: 'markets.quantowin.com',
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
    logger.debug('%j connected to SOCKET', socket.id);

    socket.on('getQRCodeURL', async (data, callback) => {
      try {
        const redirectURI = `https://quantowin.com:8808/api/public/auth/wechat\
&response_type=code\
&scope=snsapi_base\
&state=${socket.id}`;

        const longURL = `https://open.weixin.qq.com/connect/oauth2/authorize?\
appid=${config.wechatConfig.corpId}\
&redirect_uri=${redirectURI}#wechat_redirect`;

        const qrCodeURL = await gzh.getShortURL(longURL);

        if (callback) callback({ ok: true, qrCodeURL });
      } catch (error) {
        logger.error('getQRCodeURL(): %j', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('setToken', async (data, callback) => {
      try {
        jwt.verify(data.token, config.jwtSecret, (error, decodedToken) => {
          try {
            if (error) {
              logger.error('jwt.verify() cb %j', error);
              throw new Error('cannot verify the jwt token');
            }
            logger.debug('decodedToken %j', decodedToken);
            logger.debug('socket.id %j', socket.id);

            const serverNsps = Object.keys(socket.server.nsps);
            logger.debug('serverNsps %j', serverNsps);

            const clientNsps = Object.keys(socket.client.nsps);
            logger.debug('clientNsps %j', clientNsps);

            const clientSockets = Object.keys(socket.client.sockets);
            logger.debug('clientSockets %j', clientSockets);

            clientSockets.forEach((clientSocketID) => {
              socket.client.sockets[clientSocketID].token = data.token;
              socket.client.sockets[clientSocketID].user = decodedToken;
              socket.client.sockets[clientSocketID].nsp.emit('authenticated', socket.client.sockets[clientSocketID]);
            });

            if (callback) callback({ ok: true });
          } catch (err) {
            logger.error('jwt.verify(): %j', err);
            if (callback) callback({ ok: false, error: err.message });
          }
        });
      } catch (error) {
        logger.error('setToken(): %j', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });
  })
  .on('authenticated', (socket) => {
    logger.debug('authenticated Socket.IO: %j', socket.user);
  })
  ;

  const marketsIO = io.of('/markets');

  smartwinMd.getStreams('ticker').on('ticker', (ticker) => {
  // smartwinMd.getStreams('marketDepth').on('marketDepth', (ticker) => {
    marketsIO.to(ticker.symbol.concat(':', ticker.dataType)).emit('tick', ticker);
  });

  marketsIO.on('connection', (socket) => {
    logger.debug('%j connected to Market.IO', socket.id);
  })
  .on('authenticated', (socket) => {
    logger.debug('authenticated Markets.IO: %j', socket.user);

    socket.on('subscribe', async (data, callback) => {
      try {
        // await can.user(socket.user, 'get', 'fundid:all/basics');
        logger.debug('Markets.IO subscribed to %j with callback: %j', data, !!callback);
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
          },
        );
      } catch (error) {
        logger.error('marketsIO.on(subscribe): %j', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('unsubscribe', async (data, callback) => {
      try {
        // await can.user(socket.user, 'get', 'fundid:all/basics');
        logger.debug('Markets.IO unsubscribed to %j with callback: %j', data, !!callback);
        if (!data.symbol) throw new Error('Missing fundid parameter');
        if (!data.resolution) throw new Error('Missing resolution parameter');

        const prevMarketsRooms = Object.keys(marketsIO.adapter.rooms);
        logger.debug('prevMarketsRooms %j', prevMarketsRooms);

        if (data.symbol === ALL) {
          const socketRooms = Object.keys(socket.rooms);
          logger.debug('Markets.IO all socket socketRooms: %j', socketRooms);

          const leaveAllRooms = socketRooms
            .filter(room => !room.includes('/markets#'))
            .map((room) => {
              logger.debug('leaving room %j', room);
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
        logger.debug('newMarketsRooms %j', newMarketsRooms);

        const removedMarketsRooms = difference(prevMarketsRooms, newMarketsRooms);
        logger.debug('removedMarketsRooms %j', removedMarketsRooms);

        removedMarketsRooms.forEach((removedRoom) => {
          const [symbol] = removedRoom.split(':');
          smartwinMd.unsubscribeMarketData({
            symbol,
            resolution: 'snapshot',
            dataType: 'ticker',
          });
        });
      } catch (error) {
        logger.error('marketsIO.on(unsubscribe): %j', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('disconnecting', () => {
      try {
        logger.debug('disconnecting %j', socket.id);
        globalPrevMarketsRooms = Object.keys(marketsIO.adapter.rooms).filter(room => !room.includes('/markets#'));
        logger.debug('globalPrevMarketsRooms %j', globalPrevMarketsRooms);
      } catch (error) {
        logger.error('marketsIO.on(disconnecting): %j', error);
      }
    });


    socket.on('disconnect', () => {
      try {
        logger.debug('%j disconnected', socket.id);
        const newMarketsRooms = Object.keys(marketsIO.adapter.rooms).filter(room => !room.includes('/markets#'));
        logger.debug('newMarketsRooms %j', newMarketsRooms);

        const removedMarketsRooms = difference(globalPrevMarketsRooms, newMarketsRooms);
        logger.debug('removedMarketsRooms %j', removedMarketsRooms);

        removedMarketsRooms.forEach((removedRoom) => {
          const [symbol] = removedRoom.split(':');
          smartwinMd.unsubscribeMarketData({
            symbol,
            resolution: 'snapshot',
            dataType: 'ticker',
          });
        });
      } catch (error) {
        logger.error('marketsIO.on(disconnect): %j', error);
      }
    });
  })
  ;

  const basicEventNames = ['order', 'trade', 'account', 'positions', 'tradingday'];
  const extraEventNames = ['combinedReport', 'liveAccount', 'livePositions'];

  const unregisterEmptyRoom = (previousRoomsSnapshot, currentRoomsSnapshot) => {
    const removedFundsRooms = difference(previousRoomsSnapshot, currentRoomsSnapshot);
    logger.debug('removedFundsRooms %j', removedFundsRooms);

    removedFundsRooms.forEach((removedRoom) => {
      const needUnregisterEventIndex =
        fundsRegisteredEvents.findIndex(obj => obj.roomName === removedRoom);

      if (needUnregisterEventIndex !== -1) {
        logger.debug('needUnregisterEventIndex %j: %j', removedRoom, needUnregisterEventIndex);
        clearInterval(fundsRegisteredEvents[needUnregisterEventIndex].recursiveCall.stop());

        const removedFundsEvent = fundsRegisteredEvents.splice(needUnregisterEventIndex, 1);
        logger.debug('removedFundsEvent %j', removedFundsEvent);
      }
    });
  };

  const fundsIO = io.of('/funds');
  fundsIO.on('connection', (socket) => {
    logger.debug('%j connected to Funds.IO', socket.id);
  })
  .on('authenticated', (socket) => {
    logger.debug('authenticated Funds.IO: %j', socket.user);

    socket.on('subscribe', async (data, callback) => {
      try {
        // await can.user(socket.user, 'get', 'fundid:all/basics');
        logger.debug('Funds.IO subscribed to %j with callback: %j', data, !!callback);
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
                logger.debug('need add listener on these basic events %j', needRegisterEvents);

                needRegisterEvents.forEach((eventName) => {
                  theFundStreams.on(eventName, (eventData) => {
                    fundsIO.to(roomName).emit(eventName, eventData);
                  });
                });

                if (callback) callback({ ok: true });
              } catch (err) {
                logger.error('fundsIO.on(subscribe): %j', err);
                if (callback) callback({ ok: false, error: err.message });
              }
            },
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
                logger.debug('isNeedRegister %j: %j', roomName, isNeedRegisterGetAndEmitOnInterval);

                if (isNeedRegisterGetAndEmitOnInterval) {
                  const getAndEmitFunction = async () => {
                    try {
                      const functionName = 'get'.concat(upperFirst(data.eventName));
                      const dataFromGet = await smartwinFund[functionName]();
                      fundsIO.to(roomName).emit(data.eventName, dataFromGet);
                    } catch (err) {
                      logger.error('getAndEmitFunction(): roomName: %j, %j', roomName, err);
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
                  getAndEmitFunction();
                  const recursiveCall = makeRecursiveCall(getAndEmitFunction, 5000);

                  recursiveCall.start();
                  fundsRegisteredEvents.push({
                    roomName,
                    recursiveCall,
                  });
                  logger.debug('number of getAndEmit functions', fundsRegisteredEvents.length);
                }

                if (callback) callback({ ok: true });
              } catch (err) {
                logger.error('fundsIO.on(subscribe): %j', err);
                if (callback) callback({ ok: false, error: err.message });
              }
            },
          );
        }
      } catch (error) {
        logger.error('fundsIO.on(subscribe): %j', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('unsubscribe', async (data, callback) => {
      try {
        // await can.user(socket.user, 'get', 'fundid:all/basics');
        logger.debug('Funds.IO unsubscribed to %j with callback: %j', data, !!callback);
        if (!data) throw new Error('Missing main data object');
        if (!isString(data.fundid)) throw new Error('Missing fundid parameter or not a string');
        if (!isString(data.eventName)) throw new Error('Missing eventName parameter or not a string');

        if (!extraEventNames.includes(data.eventName) && data.eventName !== BASICS) throw new Error(`The eventName "${data.eventName}" does not exist`);

        if (data.fundid !== ALL) {
          const fundConf = config.fundConfigs.find(fund => fund.fundid === data.fundid);
          if (fundConf === undefined) throw new Error(`The fund ${data.fundid} does not exist`);
        }

        const prevFundsRooms = Object.keys(fundsIO.adapter.rooms);
        logger.debug('prevFundsRooms %j', prevFundsRooms);

        if (data.fundid === ALL) {
          const rooms = Object.keys(socket.rooms);
          logger.debug('Funds.IO all socket rooms: %j', rooms);

          const leaveAllRooms = rooms
            .filter(room => !room.includes('/funds#'))
            .map((room) => {
              if (room.includes(data.eventName)) {
                logger.debug('leaving room %j', room);
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
            },
          );
        } else if (extraEventNames.includes(data.eventName)) {
          const roomName = `${data.fundid}:${data.eventName}`;
          socket.leave(
            roomName,
            (error) => {
              if (error) throw error;
              if (callback) callback({ ok: true });
            },
          );
        }

        const newFundsRooms = Object.keys(fundsIO.adapter.rooms);
        logger.debug('newFundsRooms %j', newFundsRooms);

        unregisterEmptyRoom(prevFundsRooms, newFundsRooms);
      } catch (error) {
        logger.error('fundsIO.on(unsubscribe): %j', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('disconnecting', () => {
      try {
        logger.debug('disconnecting %j', socket.id);
        globalPrevFundsRooms = Object.keys(fundsIO.adapter.rooms).filter(room => !room.includes('/funds#'));
        logger.debug('globalPrevFundsRooms %j', globalPrevFundsRooms);
      } catch (error) {
        logger.error('fundsIO.on(disconnecting): %j', error);
      }
    });


    socket.on('disconnect', () => {
      try {
        logger.debug('%j disconnected', socket.id);
        const newFundsRooms = Object.keys(fundsIO.adapter.rooms).filter(room => !room.includes('/funds#'));
        logger.debug('newFundsRooms %j', newFundsRooms);

        unregisterEmptyRoom(globalPrevFundsRooms, newFundsRooms);
      } catch (error) {
        logger.error('marketsIO.on(disconnect): %j', error);
      }
    });
  })
  ;
}
