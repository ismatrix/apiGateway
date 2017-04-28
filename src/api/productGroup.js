import createDebug from 'debug';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

const debug = createDebug('app:api:productGroup');
const logError = createDebug('app:api:productGroup:error');
logError.log = console.error.bind(console);

export async function getProductGroups() {
  try {
    const productGroups = await crud.productgroup.getList({}, { _id: 0 });
    debug('productGroups', productGroups);

    if (!productGroups) throw Boom.notFound('productGroups not found');

    return { ok: true, productGroups };
  } catch (error) {
    logError('getProductGroups(): %o', error);
    throw error;
  }
}
