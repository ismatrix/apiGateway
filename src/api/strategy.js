import Boom from 'boom';
import crud from 'sw-mongodb-crud';
import logger from 'sw-common';

export async function getStrategies() {
  try {
    const strategies = await crud.strategy.getList({}, { _id: 0 });
    logger.info('strategies', strategies);

    if (!strategies) throw Boom.notFound('Strategies not found');

    return { ok: true, strategies };
  } catch (error) {
    logger.error('getACLs(): %j', error);
    throw error;
  }
}
