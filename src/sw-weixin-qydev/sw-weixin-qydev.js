const debug = require('debug')('sw-weixin-qydev');
import common from './common';
import user from './user';
import department from './department';
import message from './message';

const qydevApi = Object.assign(common, user, department, message);

export default function qydev(qydevConfig) {
  const prefix = 'https://qyapi.weixin.qq.com/cgi-bin/';
  const init = { prefix };
  return Object.assign(Object.create(qydevApi), qydevConfig, init);
}
