const debug = require('debug')('socketio');
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
    debug(markets.connected);
    debug('User authenticated, hello %o', socket.decoded_token.userid);
    socket.emit('message1', `got message 1 ${socket.id}`);
    socket.emit('message2', 'got message 2');
    socket.on('hi', () => {
      socket.emit('new message', `requested by ${socket.id}`);
    });
    socket.on('subscribe', (data) => {
      debug(data);
      iceLive.connect();
      iceLive.subscribe(data.symbol, data.resolution);
      socket.join(data.symbol);
    });
    socket.on('unsubscribe', (data) => {
      debug(data);
      // iceLive.connect();
      // iceLive.unsubscribe(symbol, resolution);
      socket.leave(data.symbol);
    });
  });

  const marketsSocket = through.obj(
    (chunk, enc, callback) => {
      markets.to(chunk.symbol).emit(chunk.resolution, chunk);
      callback();
    }
  );
  const iceLiveSream = iceLive.feed();
  iceLiveSream.pipe(marketsSocket);
}
