const debug = require('debug')('qydev:common');
import fetch from 'node-fetch';

export async function getAccessToken() {
  try {
    const url = `${this.prefix}gettoken?corpid=${this.corpId}&corpsecret=${this.corpSecret}`;
    const atObj = await fetch(url).then(res => res.json());
    debug('getAccessToken() atJson: %o', atObj);
    this.accessToken = atObj.access_token;
  } catch (error) {
    debug(`getAccessToken() error: ${error}`);
  }
}

const common = {
  getAccessToken,
};
export default common;
