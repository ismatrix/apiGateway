'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleWechatCallback = exports.createLoginToken = undefined;

let createLoginToken = exports.createLoginToken = (() => {
  var ref = _asyncToGenerator(function* () {
    try {
      const smartwin = yield mongodb.getdb();
      const users = smartwin.collection('USER');
      const user = yield users.findOne({ name: 'victor' });
      const body = {
        token: _jsonwebtoken2.default.sign({
          _id: user._id,
          role: user.role
        }, _config.jwtSecret)
      };
      return body;
    } catch (error) {
      debug(`Error mongo find: ${ error }`);
    }
  });

  return function createLoginToken() {
    return ref.apply(this, arguments);
  };
})();

let handleWechatCallback = exports.handleWechatCallback = (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    try {
      const code = ctx.query.code;
      const user = yield qydev.getUser(code);
      debug('userobj: %o', user);
    } catch (error) {
      debug(`Error wechat auth callback: ${ error }`);
    }
  });

  return function handleWechatCallback(_x) {
    return ref.apply(this, arguments);
  };
})();

// export async function handleWechatCallback(ctx) {
//   try {
//     const code = ctx.query.code;
//     debug('code from callback: %o', code);
//     const atRes = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${wechatConfig.corpId}&corpsecret=${wechatConfig.corpSecret}`);
//     const atJson = await atRes.json();
//     debug('atRes from fetch: %o', atJson);
//     const accessToken = atJson.access_token;
//     debug('accessToken from fetch: %o', atJson.access_token);
//     const userRes = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=${accessToken}&code=${code}`);
//     const userObj = await userRes.json();
//     debug('userobj: %o', userObj);
//   } catch (error) {
//     debug(`Error wechat auth callback: ${error}`);
//   }
// }


var _config = require('../config');

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _mongodb = require('../mongodb');

var mongodb = _interopRequireWildcard(_mongodb);

var _swWechatQydev = require('../sw-wechat-qydev');

var _swWechatQydev2 = _interopRequireDefault(_swWechatQydev);

var _wechatCrypto = require('wechat-crypto');

var _wechatCrypto2 = _interopRequireDefault(_wechatCrypto);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const debug = require('debug')('auth.js');


const cryptor = new _wechatCrypto2.default(_config.wechatConfig.token, _config.wechatConfig.encodingAESKey, _config.wechatConfig.corpId);
const qydev = (0, _swWechatQydev2.default)(_config.wechatConfig);