const debug = require('debug')('sw-wechat-qydev.js');
import user from './user.js';

const qydevApi = Object.assign(user);

export default function qydev(qydevConfig) {
  const prefix = 'https://qyapi.weixin.qq.com/cgi-bin/';
  const init = { prefix };
  return Object.assign(Object.create(qydevApi), qydevConfig, init);
}
