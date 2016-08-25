import createDebug from 'debug';
import Boom from 'boom';
import { codeitem as codeitemDB } from '../sw-mongodb-crud';

const debug = createDebug('api:codeitem');

export async function getCatalogs(catalogsFilter) {
  try {
    const catalogs = await codeitemDB.getList(catalogsFilter);

    return { ok: true, catalogs };
  } catch (error) {
    debug('getCatalogs() Error: %o', error);
    throw error;
  }
}

export async function postCatalogs(catalogs) {
  try {
    if (!catalogs) throw Boom.badRequest('Missing catalogs parameter');

    await codeitemDB.add(catalogs);

    return { ok: true };
  } catch (error) {
    debug('postCatalogs() Error: %o', error);
    throw error;
  }
}

export async function getCatalog(catalog) {
  try {
    if (!catalog) throw Boom.badRequest('Missing catalog parameter');

    await codeitemDB.get(catalog);

    return { ok: true, catalog };
  } catch (error) {
    debug('getCatalog() Error: %o', error);
    throw error;
  }
}

export async function putCatalog(catalog) {
  try {
    if (!catalog) throw Boom.badRequest('Missing catalog parameter');

    await codeitemDB.set(catalog);

    return { ok: true };
  } catch (error) {
    debug('putCatalog() Error: %o', error);
    throw error;
  }
}

export async function getCatalogItems(itemsFilter) {
  try {
    const items = await codeitemDB.getList(itemsFilter);

    return { ok: true, items };
  } catch (error) {
    debug('getCatalogItems() Error: %o', error);
    throw error;
  }
}

export async function postCatalogItems(catalog, items) {
  try {
    if (!catalog) throw Boom.badRequest('Missing catalog parameter');
    if (!items) throw Boom.badRequest('Missing items parameter');

    await codeitemDB.add();

    return { ok: true };
  } catch (error) {
    debug('postCatalogItems() Error: %o', error);
    throw error;
  }
}

export async function getCatalogItem(catalog, item) {
  try {
    if (!catalog) throw Boom.badRequest('Missing catalog parameter');
    if (!item) throw Boom.badRequest('Missing item parameter');

    await codeitemDB.get(catalog);

    return { ok: true, catalog };
  } catch (error) {
    debug('getCatalogItem() Error: %o', error);
    throw error;
  }
}

export async function putCatalogItem(catalog, item) {
  try {
    if (!catalog) throw Boom.badRequest('Missing catalog parameter');
    if (!item) throw Boom.badRequest('Missing item parameter');

    await codeitemDB.set();

    return { ok: true };
  } catch (error) {
    debug('putCatalogItem() Error: %o', error);
    throw error;
  }
}
