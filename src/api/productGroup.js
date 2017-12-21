import logger from 'sw-common';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

export async function getProductGroups() {
  try {
    const productGroups = await crud.productgroup.getList({}, { _id: 0 });
    logger.debug('productGroups', productGroups);

    if (!productGroups) throw Boom.notFound('productGroups not found');

    return { ok: true, productGroups };
  } catch (error) {
    logger.error('getProductGroups(): %j', error);
    throw error;
  }
}
