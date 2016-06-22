const debug = require('debug')('api:users');
import * as mongodb from '../mongodb';
import argon2 from 'argon2';

export async function upsertDbUser(userObj) {
  try {
    const smartwin = await mongodb.getdb();
    const users = smartwin.collection('USER');
    const filter = { userid: userObj.userid };
    const update = { $set: userObj };
    const options = { upsert: true, returnOriginal: false };
    const result = await users.findOneAndUpdate(filter, update, options);
    debug('upsertDbUser() mongodb user upsert result: %o', result);
    return result.value;
  } catch (error) {
    debug(`upsertDbUser() Error: ${error}`);
  }
}

export async function getDbUserByFilter(filter) {
  try {
    debug('filter %o', filter);
    const smartwin = await mongodb.getdb();
    const users = smartwin.collection('USER');
    const result = await users.findOne(filter);
    debug('getDbUserByFilter() findOne result : %o', result);
    return result;
  } catch (error) {
    debug(`getDbUserByFilter() Error: ${error}`);
  }
}

export async function setDbUserPassword(userid, password) {
  try {
    debug('1 %o', password);
    const salt = await argon2.generateSalt();
    debug('2 %o', userid);
    const hashedPassword = await argon2.hash(password, salt);
    debug('hasshedPassword %o', hashedPassword);
    const userObj = { userid, password: hashedPassword };
    debug('setDbUserPassword() userObj: %o', userObj);
    await upsertDbUser(userObj);
    return;
  } catch (error) {
    debug(`setDbUserPassword() Error: ${error}`);
  }
}
