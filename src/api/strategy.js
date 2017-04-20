import createDebug from 'debug';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

const debug = createDebug('app:api:strategy');
const logError = createDebug('app:api:strategy:error');
logError.log = console.error.bind(console);

export async function getStrategies() {
  try {
    const strategies = await crud.strategy.getList({}, { _id: 0 });
    debug('strategies', strategies);

    if (!strategies) throw Boom.notFound('Strategies not found');

    return { ok: true, strategies };
  } catch (error) {
    logError('getACLs(): %o', error);
    throw error;
  }
}
