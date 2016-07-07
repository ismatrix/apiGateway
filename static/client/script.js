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
});

api.on('connect', function () {
  socket.emit('authenticate', { token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzZhNDNjNjUyNmRjZWRjMDcwMjg4YjMiLCJ1c2VyaWQiOiJ2aWN0b3IiLCJkcHQiOlsi57O757uf6YOoIl0sImlhdCI6MTQ2NzE2NDg5Mn0.-ousXclNcnTbIDTJPJWnAkVVPErPw418TMKDqpWlZO0' });
  api.emit('hi', 'coucou api namespace');
  api.on('message1', (data) => console.log(data));
  api.on('message2', (data) => console.log(data));
  api.on('authenticated', () => console.log('Im authenticated'));
});
