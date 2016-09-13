// // TIP: io() with no args does auto-discovery
const socket = io();
const markets = io.connect('/markets');
const funds = io.connect('/funds')

const myToken = { token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzZhNDNjNjUyNmRjZWRjMDcwMjg4YjMiLCJ1c2VyaWQiOiJ2aWN0b3IiLCJkcHQiOlsi57O757uf6YOoIl0sImlhdCI6MTQ2NzE2NDg5Mn0.-ousXclNcnTbIDTJPJWnAkVVPErPw418TMKDqpWlZO0' };
const sub = { type: 'futures', symbol: 'IF1607', resolution: 'tick'};

// setTimeout(() => socket.emit('setToken', 'bad token'), 3000);
// setTimeout(() => socket.emit('seeToken'), 4000);
// // setTimeout(() => funds.emit('seeToken'), 5000);
// setTimeout(() => socket.emit('setToken', myToken), 2000);
// setTimeout(() => {
//   console.log('call io.connect(funds)');
//   funds = io.connect('/funds');
//   funds.on('error', function(err){
//     // do something with err
//     console.log('funds.on ERROR %s', err.message);
//   });
// }, 5000);

// setTimeout(() => funds.emit('secretOrder'), 3000);
// setTimeout(() => socket.emit('secretOrder'), 3000);
// setTimeout(() => funds.emit('secretOrder'), 3000);

const allSymbols =  [
    {
      "exchangeid": "CFFEX",
      "instrumentid": "IC1609",
      "instrumentname": "中证500股指1609",
      "istrading": 1,
      "productclass": "1",
      "productid": "IC",
      "volumemultiple": 200,
      "rank": 1
    },
    {
      "exchangeid": "CFFEX",
      "instrumentid": "IF1609",
      "instrumentname": "沪深300股指1609",
      "istrading": 1,
      "productclass": "1",
      "productid": "IF",
      "volumemultiple": 300,
      "rank": 1
    },
    {
      "exchangeid": "CFFEX",
      "instrumentid": "IH1609",
      "instrumentname": "上证50股指1609",
      "istrading": 1,
      "productclass": "1",
      "productid": "IH",
      "volumemultiple": 300,
      "rank": 1
    },
    {
      "exchangeid": "CFFEX",
      "instrumentid": "T1612",
      "instrumentname": "10年国债1612",
      "istrading": 1,
      "productclass": "1",
      "productid": "T",
      "volumemultiple": 10000,
      "rank": 1
    },
    {
      "exchangeid": "CFFEX",
      "instrumentid": "TF1612",
      "instrumentname": "5年国债1612",
      "istrading": 1,
      "productclass": "1",
      "productid": "TF",
      "volumemultiple": 10000,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "CF701",
      "instrumentname": "棉花1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "CF",
      "volumemultiple": 5,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "FG701",
      "instrumentname": "玻璃1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "FG",
      "volumemultiple": 20,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "JR609",
      "instrumentname": "粳稻1609",
      "istrading": 1,
      "productclass": "1",
      "productid": "JR",
      "volumemultiple": 20,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "LR609",
      "instrumentname": "晚籼稻1609",
      "istrading": 1,
      "productclass": "1",
      "productid": "LR",
      "volumemultiple": 20,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "MA701",
      "instrumentname": "甲醇MA1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "MA",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "OI701",
      "instrumentname": "菜籽油1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "OI",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "PM609",
      "instrumentname": "普通小麦1609",
      "istrading": 1,
      "productclass": "1",
      "productid": "PM",
      "volumemultiple": 50,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "RI701",
      "instrumentname": "早籼稻1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "RI",
      "volumemultiple": 20,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "RM701",
      "instrumentname": "菜籽粕1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "RM",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "RS609",
      "instrumentname": "油菜籽1609",
      "istrading": 1,
      "productclass": "1",
      "productid": "RS",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "SF705",
      "instrumentname": "硅铁1705",
      "istrading": 1,
      "productclass": "1",
      "productid": "SF",
      "volumemultiple": 5,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "SM701",
      "instrumentname": "锰硅1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "SM",
      "volumemultiple": 5,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "SR701",
      "instrumentname": "白砂糖1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "SR",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "TA701",
      "instrumentname": "化纤1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "TA",
      "volumemultiple": 5,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "WH701",
      "instrumentname": "强筋麦1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "WH",
      "volumemultiple": 20,
      "rank": 1
    },
    {
      "exchangeid": "CZCE",
      "instrumentid": "ZC701",
      "instrumentname": "动力煤ZC1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "ZC",
      "volumemultiple": 100,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "a1701",
      "instrumentname": "黄大豆1号1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "a",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "b1609",
      "instrumentname": "黄大豆2号1609",
      "istrading": 1,
      "productclass": "1",
      "productid": "b",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "bb1701",
      "instrumentname": "胶合板1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "bb",
      "volumemultiple": 500,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "c1701",
      "instrumentname": "黄玉米1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "c",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "cs1701",
      "instrumentname": "玉米淀粉1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "cs",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "fb1609",
      "instrumentname": "纤维板1609",
      "istrading": 1,
      "productclass": "1",
      "productid": "fb",
      "volumemultiple": 500,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "i1701",
      "instrumentname": "铁矿石1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "i",
      "volumemultiple": 100,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "j1701",
      "instrumentname": "焦炭1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "j",
      "volumemultiple": 100,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "jd1701",
      "instrumentname": "鲜鸡蛋1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "jd",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "jm1701",
      "instrumentname": "焦煤1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "jm",
      "volumemultiple": 60,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "l1701",
      "instrumentname": "聚乙烯1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "l",
      "volumemultiple": 5,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "m1701",
      "instrumentname": "豆粕1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "m",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "p1701",
      "instrumentname": "棕榈油1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "p",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "pp1701",
      "instrumentname": "聚丙烯1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "pp",
      "volumemultiple": 5,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "v1701",
      "instrumentname": "聚氯乙烯1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "v",
      "volumemultiple": 5,
      "rank": 1
    },
    {
      "exchangeid": "DCE",
      "instrumentid": "y1701",
      "instrumentname": "豆油1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "y",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "ag1612",
      "instrumentname": "白银1612",
      "istrading": 1,
      "productclass": "1",
      "productid": "ag",
      "volumemultiple": 15,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "al1611",
      "instrumentname": "铝1611",
      "istrading": 1,
      "productclass": "1",
      "productid": "al",
      "volumemultiple": 5,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "au1612",
      "instrumentname": "黄金1612",
      "istrading": 1,
      "productclass": "1",
      "productid": "au",
      "volumemultiple": 1000,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "bu1612",
      "instrumentname": "沥青1612",
      "istrading": 1,
      "productclass": "1",
      "productid": "bu",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "cu1611",
      "instrumentname": "铜1611",
      "istrading": 1,
      "productclass": "1",
      "productid": "cu",
      "volumemultiple": 5,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "fu1610",
      "instrumentname": "燃料油1609",
      "istrading": 1,
      "productclass": "1",
      "productid": "fu",
      "volumemultiple": 50,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "hc1701",
      "instrumentname": "热轧板1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "hc",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "ni1701",
      "instrumentname": "镍1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "ni",
      "volumemultiple": 1,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "pb1610",
      "instrumentname": "铅1610",
      "istrading": 1,
      "productclass": "1",
      "productid": "pb",
      "volumemultiple": 5,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "rb1701",
      "instrumentname": "螺纹钢1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "rb",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "ru1701",
      "instrumentname": "天然橡胶1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "ru",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "sn1701",
      "instrumentname": "锡1701",
      "istrading": 1,
      "productclass": "1",
      "productid": "sn",
      "volumemultiple": 1,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "wr1609",
      "instrumentname": "线材1609",
      "istrading": 1,
      "productclass": "1",
      "productid": "wr",
      "volumemultiple": 10,
      "rank": 1
    },
    {
      "exchangeid": "SHFE",
      "instrumentid": "zn1611",
      "instrumentname": "锌1611",
      "istrading": 1,
      "productclass": "1",
      "productid": "zn",
      "volumemultiple": 5,
      "rank": 1
    }
  ];

// markets.emit('authenticate', myToken);
// markets.on('unauthorized', function(error) {
//   if (error.data.type === 'UnauthorizedError' || error.data.code === 'invalid_token') {
//     console.log('token EXPIRED');
//   }
// });
// markets.on('authenticated', function() {
//   console.log('User authenticated');
//   // markets.on('tick', (data) => console.log(data));
//   markets.on('minute', (data) => console.log(data));
//   // markets.emit('subscribe', { type: 'futures', symbol: 'IF1608', resolution: 'tick' });
// });

socket.on('connect', function() {
  socket.emit('getQRCodeURL', {}, function(response) { console.log(response) });
  socket.emit('setToken', myToken, function(response) { console.log(response) });
});

// setTimeout(() => funds.emit('subscribe', { fundid: '068074' }), 2000);
setTimeout(() => funds.on('order', function(order) {
  console.log(order);
}), 500);

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

const Unsubscribe = React.createClass({
  getInitialState: function() {
    return { symbol: '' };
  },
  unsubscribe() {
    this.props.unsubscribeIns(this.state.symbol);
    const newState = Object.assign({}, this.state);
    newState.symbol = '';
    this.setState(newState);
    console.log('unsubscribed');
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
          <button type="button" className="btn btn-primary" onClick={this.unsubscribe}>
            <span>unsubscribe</span>
          </button>
        </div>
      </div>
    );
  }
});

const SubscribeFund = React.createClass({
  getInitialState: function() {
    return { symbol: '' };
  },
  subscribe() {
    this.props.subscribeFund(this.state.symbol);
    const newState = Object.assign({}, this.state);
    newState.symbol = '';
    this.setState(newState);
    console.log('unsubscribed');
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
              <div className="input-group-addon">fund</div>
              <input type="text" className="form-control" placeholder="ex: 068074,1248" value={this.state.symbol} onChange={this.handleChange} />
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

const UnsubscribeFund = React.createClass({
  getInitialState: function() {
    return { symbol: '' };
  },
  unsubscribe() {
    this.props.unsubscribeFund(this.state.symbol);
    const newState = Object.assign({}, this.state);
    newState.symbol = '';
    this.setState(newState);
    console.log('unsubscribed');
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
              <div className="input-group-addon">Fund</div>
              <input type="text" className="form-control" placeholder="ex: all or IF1608,ag1609" value={this.state.symbol} onChange={this.handleChange} />
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={this.unsubscribe}>
            <span>unsubscribe</span>
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
    let priceClass;
    if (this.props.ticker.lastPriceChange) {
      priceClass = (this.props.ticker.lastPriceChange > 0) ? 'positive' : 'negative';
    }
    const tsDate = new Date(this.props.ticker.timestamp);
    let mss = tsDate.getMilliseconds();
    if (mss < 10) {
      mss = `00${mss}`;
    } else if (mss < 100) {
      mss = `0${mss}`;
    }
    let secs = tsDate.getSeconds();
    if (secs < 10) secs = `0${secs}`;
    let mns = tsDate.getMinutes();
    if (mns < 10) mns = `0${mns}`;
    let hours = tsDate.getHours();
    if (hours < 10) hours = `0${hours}`;
    const ts = `${hours}:${mns}:${secs}.${mss}`;
    return (
        <tr>
          <td>{this.props.ticker.symbol}</td>
          <td>{this.props.ticker.resolution}</td>
          <td>{this.props.ticker.tradingDay}</td>
          <td>{ts}</td>
          <td className={priceClass}>{this.props.ticker.price.toFixed(2)}</td>
          <td className={priceClass}>{this.props.ticker.lastPriceChange.toFixed(2)}</td>
          <td>{this.props.ticker.volume}</td>
          <td>{this.props.ticker.turnover}</td>
          <td>{this.props.ticker.openInterest}</td>
          <td>{this.props.ticker.totalVolume}</td>
          <td>{this.props.ticker.totalTurnover}</td>
          <td>{this.props.ticker.bidPrice1.toFixed(2)}</td>
          <td>{this.props.ticker.askPrice1.toFixed(2)}</td>
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
      const lastTicker = this.props.lastTickers[symbol];
      items.push(<StockRow key={ticker.symbol} ticker={ticker} lastTicker={lastTicker} unsubscribeIns={this.props.unsubscribeIns}/>);
    }
    return (
      <div className="row">
        <div className="table-responsive">
          <table className="table table-striped table-hover table-condensed">
            <thead>
              <tr>
                <th>symbol</th>
                <th>resolution</th>
                <th>tradingDay</th>
                <th>timestamp</th>
                <th>price</th>
                <th>last change</th>
                <th>volume</th>
                <th className="turnover">turnover</th>
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
      if (lastTickers[data.symbol]) {
        const priceDiff = tickers[data.symbol].price - lastTickers[data.symbol].price;
        if (priceDiff !== 0) tickers[data.symbol].lastPriceChange = priceDiff;
        if (priceDiff === 0) tickers[data.symbol].lastPriceChange = lastTickers[data.symbol].lastPriceChange || 0;
      } else {
        tickers[data.symbol].lastPriceChange = 0;
      }
      this.setState({ tickers, lastTickers });
    });
  },
  subscribe(symbols) {
    let symbolsArr;
    if (symbols === 'all') symbolsArr = allSymbols.map(function(symbol) {
      return symbol.instrumentid;
    });
    else symbolsArr = symbols.split(',');

    for (const symbol of symbolsArr) {
      markets.emit('subscribe',
        { type: 'futures', symbol, resolution: 'tick' },
        (response) => {
          if (!this.state.watchingList.includes(symbol) && response.ok) {
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
        if (this.state.watchingList.includes(symbol) && response.ok) {
          const index = this.state.watchingList.indexOf(symbol);
          const watchingList = React.addons.update(
            this.state.watchingList, { $splice: [[index, 1]] });
          const tickers = Object.assign({}, this.state.tickers);
          delete tickers[symbol];
          this.setState({ tickers, watchingList });
        }
      }
    );
  },
  subscribeFund(symbols) {
    const symbolsArr = symbols.split(',');

    for (const symbol of symbolsArr) {
      funds.emit('subscribe', { fundid: symbol },
      (order) => {
        console.log(order);
      });
    }
  },
  unsubscribeFund(symbols) {
    const symbolsArr = symbols.split(',');

    for (const symbol of symbolsArr) {
      funds.emit(
        'unsubscribe',
        { fundid: symbol },
        (order) => {
          console.log(order);
        }
      );
    }
  },
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="child"><h2> Markets board </h2></div>
          <Subscribe subscribeIns={ this.subscribe }/>
          <Unsubscribe unsubscribeIns={ this.unsubscribe }/>
          <WatchList unsubscribeIns={ this.unsubscribe } watchingList={ this.state.watchingList } />
          <div className="child"><h2> Funds board </h2></div>
          <SubscribeFund subscribeFund={ this.subscribeFund }/>
          <UnsubscribeFund unsubscribeFund={ this.unsubscribeFund }/>
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
