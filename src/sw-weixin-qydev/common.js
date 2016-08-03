const debug = require('debug')('sw-weixin-qydev:common');
import fetch from 'node-fetch';
import Boom from 'boom';


export async function getAccessToken() {
  try {
    const url = `${this.prefix}gettoken?corpid=${this.corpId}&corpsecret=${this.corpSecret}`;
    const sixtyMinutes = 60 * 60 * 1000;

    if (!this.accessToken) {
      const accessTokenRes = await fetch(url).then(res => res.json());
      debug('getAccessToken() set accessTokenRes: %o', accessTokenRes);

      if (accessTokenRes.errcode) throw Boom.notFound('qydev common api errcode not null');

      this.accessToken = accessTokenRes.access_token;
      setTimeout(() => {
        debug('remove this.accessToken: %o', this.accessToken);
        delete this.accessToken;
      }, sixtyMinutes);
    }

    return this.accessToken;
  } catch (error) {
    debug(`getAccessToken() error: ${error}`);
    throw error;
  }
}

const common = {
  getAccessToken,
};
export default common;
