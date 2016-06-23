const debug = require('debug')('api:users');
import Boom from 'boom';
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

export async function getDbUserByFilter(filter, proj) {
  try {
    debug('filter %o', filter);
    const smartwin = await mongodb.getdb();
    const users = smartwin.collection('USER');
    const projection = proj || {};
    const result = await users.findOne(filter, projection);
    debug('getDbUserByFilter() findOne result : %o', result);
    return result;
  } catch (error) {
    debug(`getDbUserByFilter() Error: ${error}`);
  }
}

export async function setDbUserPassword(userid, newPassword, password) {
  try {
    const dbUser = await getDbUserByFilter({ userid }, { password: 1 });
    if (newPassword && !dbUser.password) {
      const salt = await argon2.generateSalt();
      const hashedPassword = await argon2.hash(password, salt);
      debug(`First time the user ${userid} set his password`);
      const userObj = { userid, password: hashedPassword };
      debug('setDbUserPassword() userObj: %o', userObj);
      await upsertDbUser(userObj);
      return;
    } else if (newPassword && password && dbUser.password) {
      const dbHashedPassword = dbUser.password;
      if (await argon2.verify(dbHashedPassword, password)) {
        debug(`getTokenByPassword(). ${userid} oldPassword is correct. Changing for new one`);
        const salt = await argon2.generateSalt();
        const hashedPassword = await argon2.hash(newPassword, salt);
        const userObj = { userid, password: hashedPassword };
        await upsertDbUser(userObj);
        return;
      }
      throw Boom.unauthorized('invalid password');
    }
    throw Boom.notImplemented('method not implemented');
  } catch (error) {
    debug(`setDbUserPassword(): ${error}`);
    throw error;
  }
}

export async function getDbUser(filter) {
  try {
    debug('filter %o', filter);
    const smartwin = await mongodb.getdb();
    const users = smartwin.collection('USER');
    const result = await users.findOne(filter);
    debug('getDbUserByFilter() findOne result : %o', result);
    return result;
  } catch (error) {
    debug(`getDbUserByFilter() ${error}`);
    throw error;
  }
}
