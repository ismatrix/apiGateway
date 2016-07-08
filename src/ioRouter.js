const debug = require('debug')('socketio');
import socketioJwt from 'socketio-jwt';
import { jwtSecret } from './config';

export default function ioRouter(io) {
  io.on('connection', (socket) => {
    debug('Socket Connected, socket unique ID: %o', socket.id);
    socket.on('ferret', function (name, fn) {
      debug(name);
      fn('woot');
    });
    socket.on('disconnect', () => {
      debug('Socket disconnected, unique ID: %o', socket.id);
    });
    socket.on('new message', function () {
      socket.emit('new message', socket.id);
    })
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
    socket.on('hi', (data) => {
      debug(data);
      socket.broadcast.emit('new message', 'common message');
    });
    socket.on('subscribe', (data) => {
      debug(data);
    });
  });
}
