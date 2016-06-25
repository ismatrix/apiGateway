'use strict';

var _mongodb = require('./mongodb');

var mongodb = _interopRequireWildcard(_mongodb);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _rest = require('./rest');

var _rest2 = _interopRequireDefault(_rest);

var _koaJwt = require('koa-jwt');

var _koaJwt2 = _interopRequireDefault(_koaJwt);

var _config = require('./config');

var _koaLogger = require('koa-logger');

var _koaLogger2 = _interopRequireDefault(_koaLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const debug = require('debug')('app.js');

const app = new _koa2.default();
// import convert from 'koa-convert';
// import bodyparser from 'koa-bodyparser';

debug('API Gateway starting...');

const mongoUrl = 'mongodb://localhost:27017/smartwin';
mongodb.connect(mongoUrl);

// http middleware
app.use((0, _koaLogger2.default)());
app.use((0, _koaJwt2.default)({ secret: _config.jwtSecret }).unless({ path: ['/api', '/api/wechat/auth', '/api/createLoginToken'] }));
app.use(_rest2.default.routes(), _rest2.default.allowedMethods());
// app.use(bodyparser);
app.listen(3000);