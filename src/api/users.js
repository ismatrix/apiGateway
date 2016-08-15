import createDebug from 'debug';
import Boom from 'boom';
import argon2 from 'argon2';
import * as mongodb from '../mongodb';

const debug = createDebug('api:users');

let USERS;

(async function getDb() {
  const smartwin = await mongodb.getdb();
  USERS = smartwin.collection('USER');
}());


export async function setUserPassword(userid, newPassword, password) {
  try {
    if (!userid) throw Boom.badRequest('Missing userid parameter');
    if (!newPassword) throw Boom.badRequest('Missing newPassword parameter');

    const dbUser = await USERS.findOne({ userid }, { password: 1 });
    if (!dbUser) throw Boom.notFound('User not found');

    if (newPassword && !dbUser.password) {
      const salt = await argon2.generateSalt();
      const hashedPassword = await argon2.hash(newPassword, salt);

      const update = { $set: { password: hashedPassword } };
      await USERS.findOneAndUpdate({ userid }, update);

      return { ok: true };
    } else if (newPassword && password && dbUser.password) {
      const dbHashedPassword = dbUser.password;

      if (await argon2.verify(dbHashedPassword, password)) {
        debug(`getTokenByPassword(). ${userid} oldPassword is correct. Changing for new one`);
        const salt = await argon2.generateSalt();
        const hashedPassword = await argon2.hash(newPassword, salt);

        const update = { $set: { password: hashedPassword } };
        await USERS.findOneAndUpdate({ userid }, update);

        return { ok: true };
      }
      throw Boom.unauthorized('Invalid password');
    }
    throw Boom.badImplementation('Method not implemented');
  } catch (error) {
    debug('setUserPassword() Error: %o', error);
    throw error;
  }
}

export async function getMeProfile(userid) {
  try {
    if (!userid) throw Boom.badRequest('Missing userid parameter');

    const projection = {
      _id: 0, userid: 1, name: 1, department: 1, email: 1, avatar: 1, password: 1,
    };
    const profile = await USERS.findOne({ userid }, projection);

    if (!profile) throw Boom.notFound('User not found');

    profile.hasPassword = !!profile.password;
    delete profile.password;

    return { ok: true, profile };
  } catch (error) {
    debug('getMeProfile() Error: %o', error);
    throw error;
  }
}

export async function getUsers() {
  try {
    const projection = {
      _id: 0, userid: 1, name: 1, department: 1, email: 1, avatar: 1,
    };
    const users = await USERS.find({}, projection).toArray();

    if (!users) throw Boom.notFound('Users not found');

    return { ok: true, users };
  } catch (error) {
    debug('getUsers() Error: %o', error);
    throw error;
  }
}
