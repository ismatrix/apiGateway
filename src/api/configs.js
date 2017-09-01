import Boom from 'boom';
import crud from 'sw-mongodb-crud';
import logger from 'sw-common';

export async function getNotifyConfigs() {
  try {
    const notifyConfigs = await crud.notifyconfig.getList({}, { _id: 0 });
    logger.info('notifyConfigs', notifyConfigs);

    if (!notifyConfigs) throw Boom.notFound('Notifyconfigs not found');

    return { ok: true, notifyConfigs };
  } catch (error) {
    logger.error('getNotifyConfig(): %j', error);
    throw error;
  }
}

export async function getFollowingConfigs() {
  try {
    const followingConfigs = await crud.followinconfig.getList({}, { _id: 0 });
    logger.info('followingConfigs', followingConfigs);

    if (!followingConfigs) throw Boom.notFound('FollowinConfigs not found');

    return { ok: true, followingConfigs };
  } catch (error) {
    logger.error('getFollowingConfigs(): %j', error);
    throw error;
  }
}

export async function postFollowingConfigs(configs) {
  try {
    if (!configs) throw Boom.badRequest('Missing configs parameter');

    await crud.followinconfig.add(configs);

    return { ok: true };
  } catch (error) {
    logger.error('postFollowingConfigs(): %j', error);
    throw error;
  }
}

export async function putFollowingConfig(master, update) {
  try {
    if (!master) throw Boom.badRequest('Missing master parameter');
    if (!update) throw Boom.badRequest('Missing update parameter');

    await crud.followinconfig.set(master, update);

    return { ok: true };
  } catch (error) {
    logger.error('putFollowingConfig(): %j', error);
    throw error;
  }
}

export async function deleteFollowingConfig(master) {
  try {
    if (!master) throw Boom.badRequest('Missing master parameter');

    await crud.followinconfig.remove(master);

    return { ok: true };
  } catch (error) {
    logger.error('deleteFollowingConfig(): %j', error);
    throw error;
  }
}
