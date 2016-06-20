const debug = require('debug')('qydev:user');
import fetch from 'node-fetch';

async function getUserId(code) {
  try {
    const url = `${this.prefix}user/getuserinfo?access_token=${this.accessToken}&code=${code}`;
    const userIdObj = await fetch(url).then(res => res.json());
    debug('getUserId() userIdObj: %o', userIdObj);
    return userIdObj;
  } catch (error) {
    debug(`getUserID() error: ${error}`);
  }
}

async function getUser(code) {
  try {
    await this.getAccessToken();
    const userIdObj = await this.getUserId(code);
    const userId = userIdObj.UserId;
    const url = `${this.prefix}user/get?access_token=${this.accessToken}&userid=${userId}`;
    const userObj = await fetch(url).then(res => res.json());
    return userObj;
  } catch (error) {
    debug(`getUser() error: ${error}`);
  }
}

const user = {
  getUserId,
  getUser,
};
export default user;
