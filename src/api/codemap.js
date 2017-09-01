import logger from 'sw-common';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';


export async function getCatalogs() {
  try {
    const catalogs = await crud.codemap.getList();

    return { ok: true, catalogs };
  } catch (error) {
    logger.error('getCatalogs(): %j', error);
    throw error;
  }
}

export async function getCatalog(catalogKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    logger.info(catalogKey);

    const catalog = await crud.codemap.get(catalogKey);

    return { ok: true, catalog };
  } catch (error) {
    logger.error('getCatalog(): %j', error);
    throw error;
  }
}

export async function postCatalog(catalogKey, catalog) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    if (!catalog) throw Boom.badRequest('Missing catalog parameter');

    await crud.codemap.set(catalogKey, catalog);

    return { ok: true };
  } catch (error) {
    logger.error('postCatalog(): %j', error);
    throw error;
  }
}

export async function deleteCatalog(catalogKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');

    await crud.codemap.remove(catalogKey);

    return { ok: true };
  } catch (error) {
    logger.error('deleteCatalog(): %j', error);
    throw error;
  }
}

export async function getCatalogItems(catalogKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');

    const items = await crud.codemap.getItemList(catalogKey);

    return { ok: true, items };
  } catch (error) {
    logger.error('getCatalogItems(): %j', error);
    throw error;
  }
}

export async function getCatalogItem(catalogKey, itemKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    if (!itemKey) throw Boom.badRequest('Missing itemKey parameter');

    const items = await crud.codemap.getItemList(catalogKey);

    const item = items.find(anItem => anItem.key === itemKey);

    return { ok: true, item };
  } catch (error) {
    logger.error('getCatalogItem(): %j', error);
    throw error;
  }
}

export async function putCatalogItem(catalogKey, itemKey, item) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    if (!itemKey) throw Boom.badRequest('Missing itemKey parameter');
    if (!item) throw Boom.badRequest('Missing item parameter');

    await crud.codemap.setItem(catalogKey, itemKey, item);

    return { ok: true };
  } catch (error) {
    logger.error('postCatalogItem(): %j', error);
    throw error;
  }
}

export async function postCatalogItem(catalogKey, item) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    if (!item) throw Boom.badRequest('Missing item parameter');

    await crud.codemap.addItem(catalogKey, item);

    return { ok: true };
  } catch (error) {
    logger.error('postCatalogItem(): %j', error);
    throw error;
  }
}

export async function deleteCatalogItem(catalogKey, itemKey) {
  try {
    if (!catalogKey) throw Boom.badRequest('Missing catalogKey parameter');
    if (!itemKey) throw Boom.badRequest('Missing itemKey parameter');

    await crud.codemap.removeItem(catalogKey, itemKey);

    return { ok: true };
  } catch (error) {
    logger.error('deleteCatalogItem(): %j', error);
    throw error;
  }
}
