const debug = require('debug')('socketio');

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

  const api = io
    .of('/api')
    .on('connection', (socket) => {
      debug('api connected');
      socket.emit('message1', 'got message 1');
      api.emit('message2', 'got message 2');
      socket.on('hi', (data) => debug(data));
    });
}
