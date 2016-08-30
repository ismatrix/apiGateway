import createDebug from 'debug';
import Boom from 'boom';
import { codemap as codemapDB } from '../sw-mongodb-crud';

const debug = createDebug('api:codemap');

export async function getCatalogs() {
  try {
    const catalogs = await codemapDB.getList();

    return { ok: true, catalogs };
  } catch (error) {
    debug('getCatalogs() Error: %o', error);
    throw error;
  }
}

export async function getCatalog(catalogKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');

    const catalog = await codemapDB.get(catalogKey);

    return { ok: true, catalog };
  } catch (error) {
    debug('getCatalog() Error: %o', error);
    throw error;
  }
}

export async function postCatalog(catalogKey, catalog) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    if (!catalog) throw Boom.badRequest('Missing catalog parameter');

    await codemapDB.set(catalogKey, catalog);

    return { ok: true };
  } catch (error) {
    debug('postCatalog() Error: %o', error);
    throw error;
  }
}

export async function deleteCatalog(catalogKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');

    await codemapDB.remove(catalogKey);

    return { ok: true };
  } catch (error) {
    debug('deleteCatalog() Error: %o', error);
    throw error;
  }
}

export async function getCatalogItems(catalogKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');

    const items = await codemapDB.getItemList(catalogKey);

    return { ok: true, items };
  } catch (error) {
    debug('getCatalogItems() Error: %o', error);
    throw error;
  }
}

export async function getCatalogItem(catalogKey, itemKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    if (!itemKey) throw Boom.badRequest('Missing itemKey parameter');

    const items = await codemapDB.getItemList(catalogKey);

    const item = items.find((anItem) => anItem.key === itemKey);

    return { ok: true, item };
  } catch (error) {
    debug('getCatalogItem() Error: %o', error);
    throw error;
  }
}

export async function putCatalogItem(catalogKey, itemKey, item) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    if (!itemKey) throw Boom.badRequest('Missing itemKey parameter');
    if (!item) throw Boom.badRequest('Missing item parameter');

    await codemapDB.setItem(catalogKey, itemKey, item);

    return { ok: true };
  } catch (error) {
    debug('postCatalogItem() Error: %o', error);
    throw error;
  }
}

export async function postCatalogItem(catalogKey, item) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    if (!item) throw Boom.badRequest('Missing item parameter');

    await codemapDB.addItem(catalogKey, item);

    return { ok: true };
  } catch (error) {
    debug('postCatalogItem() Error: %o', error);
    throw error;
  }
}

export async function deleteCatalogItem(catalogKey, itemKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    if (!itemKey) throw Boom.badRequest('Missing itemKey parameter');

    await codemapDB.removeItem(catalogKey, itemKey);

    return { ok: true };
  } catch (error) {
    debug('deleteCatalogItem() Error: %o', error);
    throw error;
  }
}
