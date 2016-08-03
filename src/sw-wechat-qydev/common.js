const debug = require('debug')('qydev:common');
import fetch from 'node-fetch';
import Boom from 'boom';

export async function getAccessToken() {
  try {
    const url = `${this.prefix}gettoken?corpid=${this.corpId}&corpsecret=${this.corpSecret}`;
    const accessTokenRes = await fetch(url).then(res => res.json());
    debug('getAccessToken() accessTokenRes: %o', accessTokenRes);

    if (accessTokenRes.errcode !== 0) throw Boom.notFound('qydev user api errcode not null');

    this.accessToken = accessTokenRes.access_token;
  } catch (error) {
    debug(`getAccessToken() error: ${error}`);
    throw error;
  }
}

const common = {
  getAccessToken,
};
export default common;
