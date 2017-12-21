import logger from 'sw-common';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

export async function getStrategies() {
  try {
    const strategies = await crud.strategy.getList({}, { _id: 0 });
    logger.debug('strategies', strategies);

    if (!strategies) throw Boom.notFound('Strategies not found');

    return { ok: true, strategies };
  } catch (error) {
    logger.error('getACLs(): %j', error);
    throw error;
  }
}
