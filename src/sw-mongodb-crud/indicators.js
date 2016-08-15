/** @module sw-mongodb-crud/fund */
import createDebug from 'debug';
import * as mongodb from '../mongodb';

const debug = createDebug('sw-mongodb-crud:indicators');

let INDICATORS;

async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    INDICATORS = smartwin.collection('INDICATORS');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}

export async function getMany(options) {
  try {
    await getDb();

    const query = {
      $and: [],
    };
    if ('symbol' in options) query.$and.push({ symbol: { $in: options.symbols } });
    if ('name' in options) query.$and.push({ name: 'bull bear trend' });

    const projection = { _id: 0, name: 0 };
    const funds = await INDICATORS.find(query, projection).toArray();
    return funds;
  } catch (error) {
    debug('getList() Error: %o', error);
  }
}

export async function distinct(options) {
  try {
    await getDb();
    return INDICATORS.distinct(options.key, options.filter);
  } catch (error) {
    debug('distinct() Error: %o', error);
  }
}

export async function addMany(documents) {
  try {
    await getDb();

    const ret = await INDICATORS.insertMany(documents);

    return ret.result;
  } catch (error) {
    debug('instrument.add() Error: %o', error);
    throw error;
  }
}
