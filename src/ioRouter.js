import createDebug from 'debug';
import through from 'through2';
import jwt from 'jsonwebtoken';
import { difference } from 'lodash';
import { jwtSecret, wechatConfig } from './config';
import iceLive from './sw-datafeed-icelive';
import createIceBroker from './sw-broker-ice';

const debug = createDebug('ioRouter');

export default function ioRouter(io) {
  io.use((socket, next) => {
    const Namespace = Object.getPrototypeOf(socket.server.sockets).constructor;
    Namespace.events.push('authenticated');
    return next();
  });
  io.on('connection', (socket) => {
    debug('%o connected to SOCKET', socket.id);

    socket.on('setToken', async (data, callback) => {
      try {
        jwt.verify(data.token, jwtSecret, (error, decodedToken) => {
          if (error) throw error;
          debug('decodedToken %o', decodedToken);

          const nspsNames = Object.keys(socket.server.nsps);
          debug('nspsNames %o', nspsNames);
          debug('socket.id %o', socket.id);

          for (const nspsName of nspsNames) {
            const socketName = nspsName.concat(socket.id.slice(1, socket.id.length));
            debug('socketName %o', socketName);
            const namespace = socket.server.nsps[nspsName];
            // debug('namespace %o', namespace);

            namespace.sockets[socketName].token = decodedToken;
            namespace.emit('authenticated', namespace.sockets[socketName]);
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
  marketsIO.on('connection', socket => {
    debug('%o connected to Market.IO', socket.id);
  })
  .on('authenticated', (socket) => {
    debug('authenticated Markets.IO: %o', socket.token);

    socket.on('subscribe', async (data, callback) => {
      try {
        debug('Markets.IO subscribed to %o with callback: %o', data, !!callback);
        if (!data.symbol) throw new Error('Missing fundid parameter');
        if (!data.resolution) throw new Error('Missing resolution parameter');

        await iceLive.subscribe(data.symbol, data.resolution);
        socket.join(
          data.symbol.concat(':', data.resolution),
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
            .map(room => {
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

        removedMarketsRooms.map(removedRoom => {
          const instrument = removedRoom.split(':');
          return iceLive.unsubscribe(instrument[0], instrument[1]);
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

        const oldFundsRooms = Object.keys(fundsIO.adapter.rooms);
        debug('oldFundsRooms %o', oldFundsRooms);

        socket.join(
          data.fundid,
          (error) => {
            if (error) throw error;
            const newFundsRooms = Object.keys(fundsIO.adapter.rooms);
            debug('newFundsRooms %o', newFundsRooms);

            const createdFundsRooms = difference(newFundsRooms, oldFundsRooms);
            debug('createdFundsRooms %o', createdFundsRooms);

            for (const fundid of createdFundsRooms) {
              debug('fundid from room name %o', fundid);
              const iceBroker = createIceBroker(fundid);
              iceBroker.on('order', order => {
                fundsIO.to(fundid).emit('order', order);
              });
            }
            if (callback) callback({ ok: true });
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

        if (data.fundid === 'all') {
          const rooms = Object.keys(socket.rooms);
          debug('Funds.IO all socket rooms: %o', rooms);

          const leaveAllRooms = rooms
            .filter(room => !room.includes('/funds#'))
            .map(room => {
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
      } catch (error) {
        debug('fundsIO.on(unsubscribe) Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });
  })
  ;

  const marketsSocket = through.obj(
    (chunk, enc, callback) => {
      marketsIO.to(chunk.symbol.concat(':', chunk.resolution)).emit(chunk.resolution, chunk);
      callback();
    }
  );
  const iceLiveStream = iceLive.getDataFeed();
  iceLiveStream.pipe(marketsSocket);
}
