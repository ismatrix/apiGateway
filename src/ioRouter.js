import createDebug from 'debug';
import socketioJwt from 'socketio-jwt';
import through from 'through2';
import { jwtSecret, wechatConfig, funds } from './config';
import iceLive from './sw-datafeed-icelive';
import createQydev from './sw-weixin-qydev';
import createIceBroker from './sw-broker-ice';

const debug = createDebug('ioRouter');
const qydev = createQydev(wechatConfig);

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
        debug('marketsIO subscribed to %o with callback: %o', data, !!callback);

        await iceLive.subscribe(data.symbol, data.resolution);
        socket.join(data.symbol, (error) => { if (error) throw error; });
        if (callback) callback({ ok: true });
      } catch (error) {
        debug('markets.on(subscribe) Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('unsubscribe', async (data, callback) => {
      try {
        debug('marketsIO unsubscribed to %o with callback: %o', data, !!callback);

        await iceLive.unsubscribe(data.symbol, data.resolution);
        socket.leave(data.symbol, (error) => { if (error) throw error; });
        if (callback) callback({ ok: true });
      } catch (error) {
        debug('markets.on(unsubscribe) Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });
  });

  const orders = io.of('/orders');
  orders.on('connection', socketioJwt.authorize({
    secret: jwtSecret,
    timeout: 15000,
  })).on('authenticated', (socket) => {
    debug(`Socket ${socket.id} authenticated, hello ${socket.decoded_token.userid}`);

    socket.on('subscribe', async (data, callback) => {
      try {
        debug('ordersIO subscribed to %o with callback: %o', data, !!callback);
        await iceLive.subscribe(data.symbol, data.resolution);
        socket.join(data.symbol, (error) => { if (error) throw error; });
        if (callback) callback({ ok: true });
      } catch (error) {
        debug('orders.on(subscribe) Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on('unsubscribe', async (data, callback) => {
      try {
        debug('ordersIO unsubscribed to %o with callback: %o', data, !!callback);
        iceLive.connect();
        await iceLive.unsubscribe(data.symbol, data.resolution);
        socket.leave(data.symbol, (error) => { if (error) throw error; });
        if (callback) callback({ ok: true });
      } catch (error) {
        debug('orders.on(unsubscribe) Error: %o', error);
        if (callback) callback({ ok: false, error: error.message });
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
      // if (chunk.symbol === 'IF1608') debug('chunk, %o', chunk);
      markets.to(chunk.symbol).emit(chunk.resolution, chunk);
      callback();
    }
  );
  const iceLiveStream = iceLive.getDataFeed();
  iceLiveStream.pipe(marketsSocket);
}
