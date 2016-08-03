const debug = require('debug')('qydev:user');
import fetch from 'node-fetch';
import Boom from 'boom';

async function getUserId(code) {
  try {
    const url = `${this.prefix}user/getuserinfo?access_token=${this.accessToken}&code=${code}`;
    const userIdRes = await fetch(url).then(res => res.json());
    debug('getUserId() userIdRes: %o', userIdRes);

    if (userIdRes.errcode) throw Boom.notFound('qydev user api errcode not null');

    return userIdRes;
  } catch (error) {
    debug(`getUserID() error: ${error}`);
    throw error;
  }
}

async function getUser(code) {
  try {
    await this.getAccessToken();
    const userIdObj = await this.getUserId(code);
    const userId = userIdObj.UserId;
    const url = `${this.prefix}user/get?access_token=${this.accessToken}&userid=${userId}`;
    const userRes = await fetch(url).then(res => res.json());
    debug('getUser() userRes: %o', userRes);

    if (userRes.errcode !== 0) throw Boom.notFound('qydev user api errcode not null');

    return userRes;
  } catch (error) {
    debug(`getUser() error: ${error}`);
    throw error;
  }
}

async function getUserWithDepartments(code) {
  try {
    const user = await this.getUser(code);
    const allDepartments = await this.getDepartmentById('1');

    const userDepartments = allDepartments.filter(dpt => user.department.includes(dpt.id));
    user.department = userDepartments;
    return user;
  } catch (error) {
    debug(`getUser() error: ${error}`);
    throw error;
  }
}

const user = {
  getUserId,
  getUser,
  getUserWithDepartments,
};
export default user;
