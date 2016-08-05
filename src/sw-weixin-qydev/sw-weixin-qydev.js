import debugModule from 'debug';
import common from './common';
import user from './user';
import department from './department';
import message from './message';
import crypto from './crypto';

const debug = debugModule('sw-weixin-qydev');
debug();

const qydevApi = Object.assign(common, user, department, message, crypto);

export default function qydev(qydevConfig) {
  const prefix = 'https://qyapi.weixin.qq.com/cgi-bin/';

  const init = { prefix };
  return Object.assign(Object.create(qydevApi), qydevConfig, init);
}
