import Boom from 'boom';
import crud from 'sw-mongodb-crud';
import logger from 'sw-common';

export async function getProductGroups() {
  try {
    const productGroups = await crud.productgroup.getList({}, { _id: 0 });
    logger.info('productGroups', productGroups);

    if (!productGroups) throw Boom.notFound('productGroups not found');

    return { ok: true, productGroups };
  } catch (error) {
    logger.error('getProductGroups(): %j', error);
    throw error;
  }
}
