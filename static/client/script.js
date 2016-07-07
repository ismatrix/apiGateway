// TIP: io() with no args does auto-discovery
var socket = io();
var api = io.connect('http://localhost:3000/api');

socket.on('connect', function() {
  console.log('Socket Connected, socket unique ID: %o', socket.id);
  socket.emit('ferret', 'tobi', function (data) {
    console.log(data); // data will be 'woot'
  });
  socket.on('token', function(data) {
    console.log('login token, save in localstorage: %o', data);
  });
  socket.emit('clientMessage', { token: 'Im the token' });
});

api.on('connect', function () {
  api.emit('hi', 'coucou api namespace');
  api.on('message1', (data) => console.log(data));
  api.on('message2', (data) => console.log(data));
});
