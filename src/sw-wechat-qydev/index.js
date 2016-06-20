const debug = require('debug')('qydev:index');
import common from './common';
import user from './user';
import department from './department';

const qydevApi = Object.assign(common, user, department);

export default function qydev(qydevConfig) {
  const prefix = 'https://qyapi.weixin.qq.com/cgi-bin/';
  const init = { prefix };
  return Object.assign(Object.create(qydevApi), qydevConfig, init);
}
