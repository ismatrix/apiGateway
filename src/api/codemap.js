import createDebug from 'debug';
import Boom from 'boom';
import { codemap as codemapDB } from 'sw-mongodb-crud';

const debug = createDebug('app:api:codemap');
const logError = createDebug('app:api:codemap:error');
logError.log = console.error.bind(console);

export async function getCatalogs() {
  try {
    const catalogs = await codemapDB.getList();

    return { ok: true, catalogs };
  } catch (error) {
    logError('getCatalogs(): %o', error);
    throw error;
  }
}

export async function getCatalog(catalogKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    debug(catalogKey);

    const catalog = await codemapDB.get(catalogKey);

    return { ok: true, catalog };
  } catch (error) {
    logError('getCatalog(): %o', error);
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
    logError('postCatalog(): %o', error);
    throw error;
  }
}

export async function deleteCatalog(catalogKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');

    await codemapDB.remove(catalogKey);

    return { ok: true };
  } catch (error) {
    logError('deleteCatalog(): %o', error);
    throw error;
  }
}

export async function getCatalogItems(catalogKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');

    const items = await codemapDB.getItemList(catalogKey);

    return { ok: true, items };
  } catch (error) {
    logError('getCatalogItems(): %o', error);
    throw error;
  }
}

export async function getCatalogItem(catalogKey, itemKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    if (!itemKey) throw Boom.badRequest('Missing itemKey parameter');

    const items = await codemapDB.getItemList(catalogKey);

    const item = items.find(anItem => anItem.key === itemKey);

    return { ok: true, item };
  } catch (error) {
    logError('getCatalogItem(): %o', error);
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
    logError('postCatalogItem(): %o', error);
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
    logError('postCatalogItem(): %o', error);
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
    logError('deleteCatalogItem(): %o', error);
    throw error;
  }
}
