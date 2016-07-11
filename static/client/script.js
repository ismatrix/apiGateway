// // TIP: io() with no args does auto-discovery
var socket = io();
var markets = io.connect('/markets');
var myToken = { token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzZhNDNjNjUyNmRjZWRjMDcwMjg4YjMiLCJ1c2VyaWQiOiJ2aWN0b3IiLCJkcHQiOlsi57O757uf6YOoIl0sImlhdCI6MTQ2NzE2NDg5Mn0.-ousXclNcnTbIDTJPJWnAkVVPErPw418TMKDqpWlZO0' };
var sub = { type: 'futures', symbol: 'IF1607', resolution: 'tick'};
var symbols = [
  'ag1607',
  'al1607',
  'au1607',
  'bb1607',
  'bu1607',
  'cu1607',
  'fb1607',
  'fu1607',
  'hc1607',
  'i1607',
  'IC1607',
  'IF1607',
  'IH1607',
  'j1607',
  'jd1607',
  'jm1607',
  'l1607',
  'ni1607',
  'p1607',
  'pb1607',
  'pp1607',
  'rb1607',
  'ru1607',
  'sn1607',
  'T1607',
  'TF1607',
  'v1607',
  'wr1607',
  'zn1607',
];

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
  markets.on('tick', (data) => console.log(data));
  markets.on('minute', (data) => console.log(data));
});

<button className="subscribeBtn" type="button" onClick={this.subscribe}>
  <span className="subscribeTxt" aria-hidden="true">subscribe</span>
</button>

var StockRow = React.createClass({
  unwatch() {
    this.props.unwatchStockHandler(this.props.stock.symbol);
  },
  render() {
    var lastClass = '',
        changeClass = 'change-positive',
        iconClass = 'glyphicon glyphicon-triangle-top';
    if (this.props.stock === this.props.last) {
        lastClass = this.props.stock.change < 0 ? 'last-negative' : 'last-positive';
    }
    if (this.props.stock.change < 0) {
        changeClass = 'change-negative';
        iconClass = 'glyphicon glyphicon-triangle-bottom';
    }
    return (
      <tr>
        <td>{this.props.stock.symbol}</td>
        <td>{this.props.stock.price}</td>
        <td>
          <button className="unsubscribeBtn" type="button" onClick={this.unsubscribe}>
            <span className="unsubscribeTxt" aria-hidden="true">unsubscribe</span>
          </button>
        </td>
      </tr>
    );
  }
});

var StockTable = React.createClass({
  render() {
    var items = [];
    for (var symbol in this.props.stocks) {
      var stock = this.props.stocks[symbol];
      items.push(<StockRow key={stock.symbol} stock={stock} last={this.props.last} unwatchStockHandler={this.props.unwatchStockHandler}/>);
    }
    return (
      <div className="row">
        <table className="table-hover">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Open</th>
              <th>Last</th>
              <th>Change</th>
              <th>High</th>
              <th>Low</th>
              <th>Unwatch</th>
            </tr>
          </thead>
          <tbody>
            {items}
          </tbody>
        </table>
      </div>
    );
  }
});

const HomePage = React.createClass({
  getInitialState() {
    var instruments = {};
    markets.on('tick', (data) => console.log(data));
    return { instruments };
  },
  subscribe(symbol) {
    markets.emit('subscribe', { type: 'futures', symbol: symbol, resolution: 'tick'});
  },
  unsubscribe(symbol) {
    markets.emit('unsubscribe', { type: 'futures', symbol: symbol, resolution: 'tick'});
  },
  render() {
    return (
      <div className="home">
        <h1 className="commentBox"> Smartwin trading board. </h1>
        <Subscribe subscribeIns={ this.subscribe }/>
        <StockTable unsubscribeIns = { this.unsubscribe } instruments={ this.state.instruments } />
      </div>
    );
  }
});
ReactDOM.render(
  <HomePage />,
  document.getElementById('root')
);
