const debug = require('debug')('socketio');
import socketioJwt from 'socketio-jwt';
import { jwtSecret } from './config';

// io.of('/api').on('connection', socketioJwt.authorize({
//   secret: jwtSecret,
//   timeout: 15000,
// })).on('authenticated', (socket) => {
//   debug('hello! %o', socket.decoded_token.userid);
// });
//
// io.on('connection', (socket) => {
//   debug('Socket Connected, socket unique ID: %o', socket.id);
//   socket.on('authenticate', (data) => {
//     debug('client token: %o', data);
//   });
//   socket.on('disconnect', () => {
//     debug('Socket disconnected, unique ID: %o', socket.id);
//   });
// });
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
  });

  const api = io.of('/api');
  api.on('connection', socketioJwt.authorize({
    secret: jwtSecret,
    timeout: 15000,
  })).on('authenticated', () => {
    debug('api connected, hello %o', api.decoded_token.userid);
    api.emit('message1', 'got message 1');
    api.emit('message2', 'got message 2');
    api.on('hi', (data) => debug(data));
  });
}
