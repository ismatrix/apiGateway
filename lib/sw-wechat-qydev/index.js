'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = qydev;

var _user = require('./user.js');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require('debug')('sw-wechat-qydev.js');


const qydevApi = Object.assign(_user2.default);

function qydev(qydevConfig) {
  const prefix = 'https://qyapi.weixin.qq.com/cgi-bin/';
  const init = { prefix: prefix };
  return Object.assign(Object.create(qydevApi), qydevConfig, init);
}