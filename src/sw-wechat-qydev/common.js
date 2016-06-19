const debug = require('debug')('user.js');
import fetch from 'node-fetch';

export async function getAccessToken() {
  try {
    const url = `${this.prefix}gettoken?corpid=${this.corpId}&corpsecret=${this.corpSecret}`;
    const atRes = await fetch(url);
    debug('getAccessToken() atRes: %o', atRes);
    const atJson = await atRes.json();
    debug('getAccessToken() atJson: %o', atJson);
    this.accessToken = atJson.access_token;
  } catch (error) {
    debug(`getAccessToken() error: ${error}`);
  }
}

const common = {
  getAccessToken,
};
export default common;
