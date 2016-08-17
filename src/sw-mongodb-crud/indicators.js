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
    throw error;
  }
}

export async function getList(options = {}) {
  try {
    await getDb();

    const query = {
      $and: [],
    };
    if ('symbols' in options) query.$and.push({ symbol: { $in: options.symbols } });
    if ('name' in options) query.$and.push({ name: options.name });

    if (!query.$and.length) delete query.$and;

    const projection = { _id: 0, name: 0 };
    const funds = await INDICATORS.find(query, projection).toArray();
    return funds;
  } catch (error) {
    debug('getList() Error: %o', error);
    throw error;
  }
}


export async function add(indicators) {
  try {
    if (!indicators) throw Error('Missing indicators parameter');

    await getDb();

    const ret = await INDICATORS.insertMany(indicators);

    return ret.result;
  } catch (error) {
    debug('add() Error: %o', error);
    throw error;
  }
}

export async function distinct(key, filter) {
  try {
    if (!key) throw Error('Missing key parameter');
    if (!filter) throw Error('Missing filter parameter');

    await getDb();
    return INDICATORS.distinct(key, filter);
  } catch (error) {
    debug('distinct() Error: %o', error);
    throw error;
  }
}
