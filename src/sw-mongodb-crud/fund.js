/** @module sw-mongodb-crud/fund */
import createDebug from 'debug';
import * as mongodb from '../mongodb';

const debug = createDebug('sw-mongodb-crud:fund');

let FUND;

async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    FUND = smartwin.collection('FUND');
  } catch (error) {
    debug('getDb() Error:', error);
    throw error;
  }
}

export async function getOne(query = {}) {
  try {
    await getDb();

    const projection = {
      _id: 0,
      fundid: 1,
      fundname: 1,
      investmentadviser: 1,
      funddate: 1,
      equityinitial: 1,
    };
    const fund = await FUND.findOne(query, projection);

    return fund;
  } catch (error) {
    debug('getOne() Error: %o', error);
    throw error;
  }
}

export async function getMany(query = {}) {
  try {
    await getDb();

    const projection = {
      _id: 0,
      fundid: 1,
      fundname: 1,
      investmentadviser: 1,
      funddate: 1,
      equityinitial: 1,
    };
    const funds = await FUND.find(query, projection).toArray();
    return funds;
  } catch (error) {
    debug('getMany() Error: %o', error);
    throw error;
  }
}

export async function addMany(documents) {
  try {
    if (!documents) throw Error('Missing documents parameter');

    await getDb();

    const ret = await FUND.insertMany(documents);

    return ret.result;
  } catch (error) {
    debug('addMany() Error: %o', error);
    throw error;
  }
}
