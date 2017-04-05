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
