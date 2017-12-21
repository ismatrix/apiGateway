import logger from 'sw-common';
import Boom from 'boom';
import argon2 from 'argon2';
import crud from 'sw-mongodb-crud';

export async function setUserPassword(userid, newPassword, password) {
  try {
    if (!userid) throw Boom.badRequest('Missing userid parameter');
    if (!newPassword) throw Boom.badRequest('Missing newPassword parameter');

    const user = await crud.user.get({ userid });

    if (!user) throw Boom.notFound('User not found');

    if (newPassword && !user.password) {
      // const salt = await argon2.generateSalt();
      const hashedPassword = await argon2.hash(newPassword);

      const set = { password: hashedPassword };
      const filter = { userid };
      await crud.user.set(filter, set);

      return { ok: true };
    } else if (newPassword && password && user.password) {
      const dbHashedPassword = user.password;

      if (await argon2.verify(dbHashedPassword, password)) {
        logger.debug(`getTokenByPassword(). ${userid} oldPassword is correct. Changing for new one`);
        // const salt = await argon2.generateSalt();
        const hashedPassword = await argon2.hash(newPassword);

        const set = { password: hashedPassword };
        const filter = { userid };
        await crud.user.set(filter, set);

        return { ok: true };
      }
      throw Boom.unauthorized('Invalid password');
    }
    throw Boom.badImplementation('Method not implemented');
  } catch (error) {
    logger.error('setUserPassword(): %j', error);
    throw error;
  }
}

export async function getMeProfile(userid) {
  try {
    if (!userid) throw Boom.badRequest('Missing userid parameter');

    const profile = await crud.user.get({ userid });

    if (!profile) throw Boom.notFound('User not found');

    profile.hasPassword = !!profile.password;
    delete profile.password;

    return { ok: true, profile };
  } catch (error) {
    logger.error('getMeProfile(): %j', error);
    throw error;
  }
}

export async function getUsers() {
  try {
    const users = await crud.user.getList();

    if (!users) throw Boom.notFound('Users not found');

    return { ok: true, users };
  } catch (error) {
    logger.error('getUsers(): %j', error);
    throw error;
  }
}
