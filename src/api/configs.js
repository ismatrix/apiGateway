import createDebug from 'debug';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

const debug = createDebug('app:api:configs');
const logError = createDebug('app:api:configs:error');
logError.log = console.error.bind(console);

export async function getNotifyConfigs() {
  try {
    const notifyConfigs = await crud.notifyconfig.getList({}, { _id: 0 });
    debug('notifyConfigs', notifyConfigs);

    if (!notifyConfigs) throw Boom.notFound('Notifyconfigs not found');

    return { ok: true, notifyConfigs };
  } catch (error) {
    logError('getNotifyConfig(): %o', error);
    throw error;
  }
}

export async function getFollowingConfigs() {
  try {
    const followingConfigs = await crud.followinconfig.getList({}, { _id: 0 });
    debug('followingConfigs', followingConfigs);

    if (!followingConfigs) throw Boom.notFound('FollowinConfigs not found');

    return { ok: true, followingConfigs };
  } catch (error) {
    logError('getFollowingConfigs(): %o', error);
    throw error;
  }
}

export async function postFollowingConfigs(configs) {
  try {
    if (!configs) throw Boom.badRequest('Missing configs parameter');

    await crud.followinconfig.add(configs);

    return { ok: true };
  } catch (error) {
    logError('postFollowingConfigs(): %o', error);
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
    logError('putFollowingConfig(): %o', error);
    throw error;
  }
}

export async function deleteFollowingConfig(master) {
  try {
    if (!master) throw Boom.badRequest('Missing master parameter');

    await crud.followinconfig.remove(master);

    return { ok: true };
  } catch (error) {
    logError('deleteFollowingConfig(): %o', error);
    throw error;
  }
}