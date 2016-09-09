import createModule from 'debug';
import common from './common';
import user from './user';
import menu from './menu';
import message from './message';
import crypto from './crypto';
import media from './media';

const debug = createModule('sw-weixin-gzh');

const qydevApi = Object.assign(common, user, menu, message, crypto, media);

export default function qydev(qydevConfig) {
  const prefix = 'https://api.weixin.qq.com';

  const init = { prefix };
  return Object.assign(Object.create(qydevApi), qydevConfig, init);
}
