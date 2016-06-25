'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

let getAccessToken = (() => {
  var ref = _asyncToGenerator(function* () {
    try {
      debug(`this.prefix: ${ this.prefix },
      this.accessToken: ${ this.accessToken },
      this.corpid: ${ this.corpId }
      this.corpsecret: ${ this.corpSecret }`);
      const url = `${ this.prefix }gettoken?corpid=${ this.corpId }&corpsecret=${ this.corpSecret }`;
      const atRes = yield (0, _nodeFetch2.default)(url);
      const atJson = yield atRes.json();
      this.accessToken = atJson;
    } catch (error) {
      debug(`getAccessToken() error: ${ error }`);
    }
  });

  return function getAccessToken() {
    return ref.apply(this, arguments);
  };
})();

let getUser = (() => {
  var ref = _asyncToGenerator(function* (code) {
    try {
      getAccessToken();
      debug(`this.prefix: ${ this.prefix },
      this.accessToken: ${ this.accessToken },
      this.corpid: ${ this.corpId }
      this.corpsecret: ${ this.corpSecret }`);
      const url = `${ this.prefix }user/getuserinfo?access_token=${ this.accessToken }&code=${ code }`;
      const userRes = yield (0, _nodeFetch2.default)(url);
      const userObj = yield userRes.json();
      return userObj;
    } catch (error) {
      debug(`getUser() error: ${ error }`);
    }
  });

  return function getUser(_x) {
    return ref.apply(this, arguments);
  };
})();

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const debug = require('debug')('user.js');


const user = {
  getUser: getUser
};
exports.default = user;