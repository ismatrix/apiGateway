const debug = require('debug')('api:users');
import Boom from 'boom';
import * as mongodb from '../mongodb';
import argon2 from 'argon2';

export async function upsertDbUser(userObj) {
  try {
    const smartwin = await mongodb.getdb();
    const users = smartwin.collection('USER');
    const filter = { userid: userObj.userid.toLowerCase() };
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
    if (!userid) throw Boom.badRequest('Missing userid parameter');
    if (!newPassword) throw Boom.badRequest('Missing newPassword parameter');

    const dbUser = await getDbUserByFilter({ userid }, { password: 1 });
    if (!dbUser) throw Boom.notFound('User not found');

    if (newPassword && !dbUser.password) {
      const salt = await argon2.generateSalt();
      const hashedPassword = await argon2.hash(newPassword, salt);
      debug(`First time the user ${userid} set his password`);
      const userObj = { userid, password: hashedPassword };
      debug('setDbUserPassword() userObj: %o', userObj);
      await upsertDbUser(userObj);
      return { ok: true };
    } else if (newPassword && password && dbUser.password) {
      const dbHashedPassword = dbUser.password;
      if (await argon2.verify(dbHashedPassword, password)) {
        debug(`getTokenByPassword(). ${userid} oldPassword is correct. Changing for new one`);
        const salt = await argon2.generateSalt();
        const hashedPassword = await argon2.hash(newPassword, salt);
        const userObj = { userid, password: hashedPassword };
        await upsertDbUser(userObj);
        return { ok: true };
      }
      throw Boom.unauthorized('Invalid password');
    }
    throw Boom.badImplementation('Method not implemented');
  } catch (error) {
    debug(`setDbUserPassword(): ${error}`);
    throw error;
  }
}

export async function getMeProfile(userid) {
  try {
    if (!userid) throw Boom.badRequest('Missing userid parameter');

    const projection = {
      _id: 0, userid: 1, name: 1, department: 1, email: 1, avatar: 1, password: 1,
    };
    const profile = await mongodb.findOne('USER', { userid }, projection);

    if (!profile) throw Boom.notFound('User not found');

    profile.hasPassword = !!profile.password;
    delete profile.password;

    return { ok: true, profile };
  } catch (error) {
    debug(`getViewerData() ${error}`);
    throw error;
  }
}

export async function getUsers() {
  try {
    const projection = {
      _id: 0, userid: 1, name: 1, department: 1, email: 1, avatar: 1,
    };
    const users = await mongodb.find('USER', {}, projection);

    if (!users) throw Boom.notFound('Users not found');

    return { ok: true, users };
  } catch (error) {
    debug(`getViewerData() ${error}`);
    throw error;
  }
}
