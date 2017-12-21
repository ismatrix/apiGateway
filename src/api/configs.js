import logger from 'sw-common';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

export async function getNotifyConfigs() {
  try {
    const notifyConfigs = await crud.notifyconfig.getList({}, { _id: 0 });
    logger.debug('notifyConfigs', notifyConfigs);

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
    logger.debug('followingConfigs', followingConfigs);

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

export async function getStrongweakConfigs() {
  try {
    const strongweakConfigs = await crud.strongweakconfig.getList({}, { _id: 0 });
    logger.debug('strongweakConfigs', strongweakConfigs);

    if (!strongweakConfigs) throw Boom.notFound('StrongweakConfigs not found');

    return { ok: true, strongweakConfigs };
  } catch (error) {
    logger.error('getStrongweakConfigs(): %j', error);
    throw error;
  }
}

export async function postStrongweakConfigs(configs) {
  try {
    if (!configs) throw Boom.badRequest('Missing configs parameter');

    await crud.strongweakconfig.add(configs);

    return { ok: true };
  } catch (error) {
    logger.error('postStrongweakConfigs(): %j', error);
    throw error;
  }
}

export async function putStrongweakConfig(plate, update) {
  try {
    if (!plate) throw Boom.badRequest('Missing plate parameter');
    if (!update) throw Boom.badRequest('Missing update parameter');

    await crud.strongweakconfig.set(plate, update);

    return { ok: true };
  } catch (error) {
    logger.error('putStrongweakConfig(): %j', error);
    throw error;
  }
}

export async function deleteStrongweakConfig(plate) {
  try {
    if (!plate) throw Boom.badRequest('Missing plate parameter');

    await crud.strongweakconfig.remove(plate);

    return { ok: true };
  } catch (error) {
    logger.error('deleteStrongweakConfig(): %j', error);
    throw error;
  }
}
