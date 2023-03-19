import logger from 'sw-common';
import Boom from 'boom';
import mongodb from 'sw-mongodb';
import {
  productionConfig,
} from './config';

export async function getCollections() {
  try {
    const dbInstance = await mongodb.getDB(productionConfig.mongodbURL);
    // crud.setDB(dbInstance);

    const collections = await dbInstance.db('smartwin').listCollections().toArray();
    if (!collections) throw Boom.notFound('collections not found');

    return { ok: true, collections: collections.map(x => x.name) };
  } catch (error) {
    logger.error('getCollections(): %j', error);
    throw error;
  }
}
