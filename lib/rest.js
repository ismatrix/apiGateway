'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _funds = require('./api/funds');

var funds = _interopRequireWildcard(_funds);

var _marketData = require('./api/marketData');

var marketData = _interopRequireWildcard(_marketData);

var _instruments = require('./api/instruments');

var instruments = _interopRequireWildcard(_instruments);

var _auth = require('./api/auth');

var auth = _interopRequireWildcard(_auth);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const router = require('koa-router')({ prefix: '/api' });
const debug = require('debug')('rest.js');

router.get('/', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = 'Welcome to SmartWin REST API';
  });

  return function (_x) {
    return ref.apply(this, arguments);
  };
})());

router.get('/login', instruments.getMain).get('/createLoginToken', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield auth.createLoginToken();
  });

  return function (_x2) {
    return ref.apply(this, arguments);
  };
})()).get('/wechat/auth', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield auth.handleWechatCallback(ctx);
  });

  return function (_x3) {
    return ref.apply(this, arguments);
  };
})());

router.get('/instruments/:mainid', instruments.getMain);

router.get('/fund', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield funds.getFunds();
  });

  return function (_x4) {
    return ref.apply(this, arguments);
  };
})()).get('/fund/:fundid', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield funds.getFund(ctx.params.fundid);
  });

  return function (_x5) {
    return ref.apply(this, arguments);
  };
})()).get('/fund/level', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield funds.getAllPositionLevel();
  });

  return function (_x6) {
    return ref.apply(this, arguments);
  };
})()).get('/fund/checkreport/:tradingday', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield funds.checkreport();
  });

  return function (_x7) {
    return ref.apply(this, arguments);
  };
})()).get('/fund/rtequity', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield funds.getRealTimeEquity();
  });

  return function (_x8) {
    return ref.apply(this, arguments);
  };
})()).get('/fund/equity/:fundid', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield funds.getEquity();
  });

  return function (_x9) {
    return ref.apply(this, arguments);
  };
})()).get('/fund/position/:fundid', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield funds.getPosition();
  });

  return function (_x10) {
    return ref.apply(this, arguments);
  };
})());

router.get('/marketdata/candlestick/:insid', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield marketData.getCandleStick();
  });

  return function (_x11) {
    return ref.apply(this, arguments);
  };
})()).get('/marketdata/avg/:insid/:days/:col', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield marketData.getAvg();
  });

  return function (_x12) {
    return ref.apply(this, arguments);
  };
})()).get('/marketdata/ma', (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    ctx.body = yield marketData.getAllMA();
  });

  return function (_x13) {
    return ref.apply(this, arguments);
  };
})());

exports.default = router;