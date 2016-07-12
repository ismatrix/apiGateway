// // TIP: io() with no args does auto-discovery
const socket = io();
const markets = io.connect('/markets');
const myToken = { token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzZhNDNjNjUyNmRjZWRjMDcwMjg4YjMiLCJ1c2VyaWQiOiJ2aWN0b3IiLCJkcHQiOlsi57O757uf6YOoIl0sImlhdCI6MTQ2NzE2NDg5Mn0.-ousXclNcnTbIDTJPJWnAkVVPErPw418TMKDqpWlZO0' };
const sub = { type: 'futures', symbol: 'IF1607', resolution: 'tick'};
const allSymbols = [
  'ag1608',
  'al1608',
  'au1608',
  'bb1608',
  'bu1608',
  'cu1608',
  'fb1608',
  'fu1608',
  'hc1608',
  'i1608',
  'IC1608',
  'IF1608',
  'IH1608',
  'j1608',
  'jd1608',
  'jm1608',
  'l1608',
  'ni1608',
  'p1608',
  'pb1608',
  'pp1608',
  'rb1608',
  'ru1608',
  'sn1608',
  'T1608',
  'TF1608',
  'v1608',
  'wr1608',
  'zn1608',
];

markets.emit('authenticate', myToken);
markets.on('unauthorized', function(error) {
  if (error.data.type == 'UnauthorizedError' || error.data.code == 'invalid_token') {
    console.log('token EXPIRED');
  }
});
markets.on('authenticated', function() {
  console.log('User authenticated');
  // markets.on('tick', (data) => console.log(data));
  markets.on('minute', (data) => console.log(data));
  // markets.emit('subscribe', { type: 'futures', symbol: 'IF1608', resolution: 'tick' });
});

const WatchList = React.createClass({
  unsubscribe(symbol) {
    console.log('unsubscribe');
    this.props.unsubscribeIns(symbol);
  },
  render() {
    const watchingList = this.props.watchingList;
    const watchingLabels = watchingList.map((symbol) => {
      return  <button key={symbol} type="button" className="label label-danger" onClick={() => this.unsubscribe(symbol)}> {symbol} <span aria-hidden="true">&times;</span></button> ;
    });
    return (
      <div className="child">
        {watchingLabels}
      </div>
    );
  }
});

const Subscribe = React.createClass({
  getInitialState: function() {
    return { symbol: '' };
  },
  subscribe() {
    this.props.subscribeIns(this.state.symbol);
    const newState = Object.assign({}, this.state);
    newState.symbol = '';
    this.setState(newState);
    console.log('subscribed');
  },
  handleChange(event) {
    this.setState({ symbol: event.target.value });
  },
  render() {
    return (
      <div className="child">
        <div className="form-inline">
          <div className="form-group">
            <div className="input-group">
              <div className="input-group-addon">symbols</div>
              <input type="text" className="form-control" placeholder="ex: all or IF1608,ag1609" value={this.state.symbol} onChange={this.handleChange} />
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={this.subscribe}>
            <span>subscribe</span>
          </button>
        </div>
      </div>
    );
  }
});

var StockRow = React.createClass({
  unsubscribe() {
    this.props.unsubscribeIns(this.props.ticker.symbol);
  },
  render() {
    let lastClass = '';
    const price = this.props.ticker.price;
    const lastPrice = this.props.lastTicker.price || 0;
    const priceDiff = price - lastPrice;
    lastClass = (priceDiff >= 0) ? 'last-positive' : 'last-negative';

    const tsDate = new Date(this.props.ticker.timestamp);
    const mss = tsDate.getMilliseconds();
    const secs = tsDate.getSeconds();
    const mns = tsDate.getMinutes();
    const hours = tsDate.getHours();
    const ts = `${hours}:${mns} ${secs}s ${mss}ms`;
    return (
        <tr>
          <td>{this.props.ticker.symbol}</td>
          <td>{this.props.ticker.resolution}</td>
          <td>{this.props.ticker.tradingDay}</td>
          <td>{ts}</td>
          <td className={lastClass}>{this.props.ticker.price.toFixed(2)}</td>
          <td>{this.props.ticker.volume}</td>
          <td>{this.props.ticker.turnover}</td>
          <td>{this.props.ticker.openInterest}</td>
          <td>{this.props.ticker.totalVolume}</td>
          <td>{this.props.ticker.totalTurnover}</td>
          <td>{this.props.ticker.bidPrice1}</td>
          <td>{this.props.ticker.askPrice1}</td>
          <td>{this.props.ticker.bidVolume1}</td>
          <td>{this.props.ticker.askVolume1}</td>
          <td>
            <button type="button" className="close" aria-label="Close" onClick={this.unsubscribe}>
              <span aria-hidden="true">&times;</span>
            </button>
          </td>
        </tr>
    );
  }
});

const StockTable = React.createClass({
  render: function () {
    const items = [];
    for (var symbol in this.props.tickers) {
      const ticker = this.props.tickers[symbol];
      const lastTicker = this.props.lastTickers[symbol] || ticker;
      items.push(<StockRow key={ticker.symbol} ticker={ticker} lastTicker={lastTicker} unsubscribeIns={this.props.unsubscribeIns}/>);
    }
    return (
      <div className="row">
        <div className="table-responsive">
          <table className="table table-striped table-hover table-condensed text-center">
            <thead>
              <tr>
                <th>symbol</th>
                <th>resolution</th>
                <th>tradingDay</th>
                <th>timestamp</th>
                <th>price</th>
                <th>volume</th>
                <th>turnover</th>
                <th>openInterest</th>
                <th>totalVolume</th>
                <th>totalTurnover</th>
                <th>bidPrice1</th>
                <th>askPrice1</th>
                <th>bidVolume1</th>
                <th>askVolume1</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
});

const HomePage = React.createClass({
  getInitialState() {
    const tickers = {};
    const lastTickers = {};
    const watchingList = [];
    return { tickers, lastTickers, watchingList };
  },
  componentDidMount() {
    markets.on('tick',
    (data) => {
      const lastTickers = Object.assign({}, this.state.tickers);
      const tickers = React.addons.update(this.state.tickers, { [data.symbol]:{ $set: data } });
      this.setState({ tickers, lastTickers });
    });
  },
  subscribe(symbols) {
    let symbolsArr;
    if (symbols === 'all') symbolsArr = allSymbols;
    else symbolsArr = symbols.split(',');

    for (const symbol of symbolsArr) {
      markets.emit('subscribe',
        { type: 'futures', symbol, resolution: 'tick' },
        (response) => {
          console.log('response %o', response);
          if (!this.state.watchingList.includes(symbol)) {
            const watchingList = React.addons.update(this.state.watchingList, { $push: [symbol] } );
            this.setState({ watchingList });
          }
        }
      );
    }
  },
  unsubscribe(symbol) {
    markets.emit('unsubscribe',
      { type: 'futures', symbol, resolution: 'tick' },
      (response) => {
        console.log('response %o', response);
        if (this.state.watchingList.includes(symbol)) {
          const index = this.state.watchingList.indexOf(symbol);
          const watchingList = React.addons.update(
            this.state.watchingList, { $splice: [[index, 1]] });
          this.setState({ watchingList });
        }
      }
    );
    const newState = Object.assign({}, this.state);
    delete newState.tickers[symbol];
    this.setState(newState);
  },
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="child"><h2> Trading board </h2></div>
          <Subscribe subscribeIns={ this.subscribe }/>
          <WatchList unsubscribeIns={ this.unsubscribe } watchingList={ this.state.watchingList } />
        </div>
        <StockTable unsubscribeIns={ this.unsubscribe } tickers={ this.state.tickers } lastTickers={this.state.lastTickers} />
      </div>
    );
  },
});

ReactDOM.render(
  <HomePage />,
  document.getElementById('root')
);
