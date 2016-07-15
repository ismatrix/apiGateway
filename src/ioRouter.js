const debug = require('debug')('ioRouter');
import socketioJwt from 'socketio-jwt';
import { jwtSecret } from './config';
import iceLive from './sw-datafeed-icelive';
import through from 'through2';

export default function ioRouter(io) {
  io.on('connection', (socket) => {
    debug('Socket Connected, socket unique ID: %o', socket.id);
    socket.on('ferret', (name, fn) => {
      debug(name);
      fn('woot');
    });
    socket.on('disconnect', () => {
      debug('Socket disconnected, unique ID: %o', socket.id);
    });
    socket.on('new message', () => {
      socket.emit('new message', socket.id);
    });
  });

  const markets = io.of('/markets');
  markets.on('connection', socketioJwt.authorize({
    secret: jwtSecret,
    timeout: 15000,
  })).on('authenticated', (socket) => {
    debug(`Socket ${socket.id} authenticated, hello ${socket.decoded_token.userid}`);

    socket.on('subscribe', async (data, callback) => {
      try {
        debug('marketsIO subscribed to %o', data);
        iceLive.connect();
        debug('1');
        await iceLive.subscribe(data.symbol, data.resolution);
        debug('2');
        socket.join(data.symbol, (error) => { if (error) throw error; });
        if (callback) callback({ ok: true });
      } catch (error) {
        debug('markets.on(subscribe) Error: %o', error);
        if (callback) callback({ ok: false, error });
      }
    });

    socket.on('unsubscribe', async (data, callback) => {
      try {
        debug('marketsIO unsubscribed to %o', data);
        iceLive.connect();
        await iceLive.unsubscribe(data.symbol, data.resolution);
        socket.leave(data.symbol, (error) => { if (error) throw error; });
        if (callback) callback({ ok: true });
      } catch (error) {
        debug('markets.on(unsubscribe) Error: %o', error);
        if (callback) callback({ ok: false, error });
      }
    });
  });

  // let i = 0;
  // setInterval(() => {
  //   i++;
  //   const tick = {
  //     symbol: 'IF1608',
  //     resolution: 'tick',
  //     tradingDay: '20160712',
  //     timestamp: Date.now(),
  //     price: i,
  //     volume: i,
  //     turnover: i,
  //     openInterest: i,
  //     totalVolume: i,
  //     totalTurnover: i,
  //     bidPrice1: i,
  //     askPrice1: i,
  //     bidVolume1: i,
  //     askVolume1: i,
  //   };
  //   markets.to('IF1608').emit('tick', tick);
  // }, 1000);

  const marketsSocket = through.obj(
    (chunk, enc, callback) => {
      if (chunk.symbol === 'IF1608') debug('chunk, %o', chunk);
      markets.to(chunk.symbol).emit(chunk.resolution, chunk);
      callback();
    }
  );
  const iceLiveSream = iceLive.feed();
  iceLiveSream.pipe(marketsSocket);
}
