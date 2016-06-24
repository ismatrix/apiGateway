
var socket = io();

socket.on('connect', function() {
  console.log('Socket Connected, socket unique ID: %o', socket.id);
  socket.on('token', function(data) {
    console.log('login token, save in localstorage: %o', data);
  });
  socket.emit('clientMessage', { token: 'Im the token' });
});
