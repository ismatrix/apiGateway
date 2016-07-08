// // TIP: io() with no args does auto-discovery
var socket = io();
var markets = io.connect('/markets');
var myToken = { token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzZhNDNjNjUyNmRjZWRjMDcwMjg4YjMiLCJ1c2VyaWQiOiJ2aWN0b3IiLCJkcHQiOlsi57O757uf6YOoIl0sImlhdCI6MTQ2NzE2NDg5Mn0.-ousXclNcnTbIDTJPJWnAkVVPErPw418TMKDqpWlZO0' };
var sub = {
  type: 'futures',
  symbol: 'IF1607',
  resolution: 'tick',
};
socket.on('connect', function() {
  console.log('Socket Connected, socket unique ID: %o', socket.id);
  socket.emit('callback', 'tobi', function (data) {
    console.log(data);
  });
  socket.emit('new message', 'tobi');
  socket.on('new message', function (data) {
    console.log(data);
  });
});


markets.emit('authenticate', myToken);
markets.on('unauthorized', function(error) {
  if (error.data.type == 'UnauthorizedError' || error.data.code == 'invalid_token') {
    console.log('token EXPIRED');
  }
});
markets.on('authenticated', function() {
  console.log('User authenticated');
  // markets.emit('hi', 'coucou markets namespace');
  // markets.emit('subscribe', sub);
  // markets.on('message1', (data) => console.log(data));
  markets.on('tick', (data) => console.log(data));
  markets.on('minute', (data) => console.log(data));
  // socket.broadcast.emit('hi', 'this is a broadcast');
});
const HomePage = React.createClass({
  subscribe() {
    markets.emit('subscribe', sub);
  },
  unsubscribe() {
    markets.emit('unsubscribe', sub);
  },
  render() {
    return (
      <div className="home">
        <h1 className="commentBox">
          Smartwin trading board.
        </h1>
        <button className="subscribeBtn" type="button" onClick={this.subscribe}>
          <span className="subscribeTxt" aria-hidden="true">subscribe</span>
        </button>
        <button className="unsubscribeBtn" type="button" onClick={this.unsubscribe}>
          <span className="unsubscribeTxt" aria-hidden="true">unsubscribe</span>
        </button>
      </div>
    );
  }
});
ReactDOM.render(
  <HomePage />,
  document.getElementById('root')
);
