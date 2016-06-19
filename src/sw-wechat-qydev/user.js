const debug = require('debug')('user.js');
import fetch from 'node-fetch';


async function getAccessToken() {
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

async function getUser(code) {
  try {
    await this.getAccessToken();
    debug(`getUser: this.accessToken ${this.accessToken}`);
    debug(`getUser: code ${code}`);
    const url = `${this.prefix}user/getuserinfo?access_token=${this.accessToken}&code=${code}`;
    const userRes = await fetch(url);
    const userObj = await userRes.json();
    debug('getUser() userObj: %o', userObj);
    return userObj;
  } catch (error) {
    debug(`getUser() error: ${error}`);
  }
}

const user = {
  getUser,
  getAccessToken,
};
export default user;
