import createDebug from 'debug';
import Boom from 'boom';
import argon2 from 'argon2';
import {
  user as dbUser,
} from '../sw-mongodb-crud';

const debug = createDebug('api:users');

export async function setUserPassword(userid, newPassword, password) {
  try {
    if (!userid) throw Boom.badRequest('Missing userid parameter');
    if (!newPassword) throw Boom.badRequest('Missing newPassword parameter');

    const user = await dbUser.getOne({ userid });

    if (!user) throw Boom.notFound('User not found');

    if (newPassword && !user.password) {
      const salt = await argon2.generateSalt();
      const hashedPassword = await argon2.hash(newPassword, salt);

      const set = { password: hashedPassword };
      const filter = { userid };
      await dbUser.setOne(filter, set);

      return { ok: true };
    } else if (newPassword && password && user.password) {
      const dbHashedPassword = user.password;

      if (await argon2.verify(dbHashedPassword, password)) {
        debug(`getTokenByPassword(). ${userid} oldPassword is correct. Changing for new one`);
        const salt = await argon2.generateSalt();
        const hashedPassword = await argon2.hash(newPassword, salt);

        const set = { password: hashedPassword };
        const filter = { userid };
        await dbUser.setOne(filter, set);

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

    const profile = await dbUser.getOne({ userid });

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
    const users = await dbUser.getMany();

    if (!users) throw Boom.notFound('Users not found');

    return { ok: true, users };
  } catch (error) {
    debug('getUsers() Error: %o', error);
    throw error;
  }
}
