const debug = require('debug')('user.js');
import fetch from 'node-fetch';

async function getUserId(code) {
  try {
    const url = `${this.prefix}user/getuserinfo?access_token=${this.accessToken}&code=${code}`;
    const userRes = await fetch(url);
    const userObj = await userRes.json();
    debug('getUser() userObj: %o', userObj);
    return userObj;
  } catch (error) {
    debug(`getUserID() error: ${error}`);
  }
}

async function getUser() {
  try {
    await this.getAccessToken();
    const userId = await this.getUserId();
    const url = `${this.prefix}user/get?access_token=${this.accessToken}&userid=${userId}`;
    const user = await fetch(url).then(res => res.json());
    return user;
  } catch (error) {
    debug(`getUser() error: ${error}`);
  }
}

const user = {
  getUserId,
  getUser,
};
export default user;
