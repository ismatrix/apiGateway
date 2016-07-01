const debug = require('debug')('api:marketData');
import Boom from 'boom';
import * as mongodb from '../mongodb';

let INDICATORS;

(async function getDb() {
  const smartwin = await mongodb.getdb();
  INDICATORS = smartwin.collection('INDICATORS');
}());

export async function getIndicesTrend(sym, start, end) {
  try {
    if (!sym || !start || !end) Boom.badRequest('Missing a parameter');
    let symbols = sym;
    if (sym.includes('all')) {
      symbols = await INDICATORS.distinct('symbol');
      debug(symbols);
    }
    debug('symbols %o', symbols);
    const query = { $and: [
      { symbol: { $in: symbols } },
      { name: 'bull bear trend' },
    ] };
    const projection = { _id: 0, name: 0 };
    return await INDICATORS.find(query, projection).stream();
  } catch (error) {
    debug('getCandleStick() Error: %o', error);
    throw error;
  }
}

export async function getAvg() {
  try {
    Boom.notImplemented('method not implemented');
  } catch (error) {
    debug('getAvg() Error: %o', error);
    throw error;
  }
}

export async function getAllMA() {
  try {
    Boom.notImplemented('method not implemented');
  } catch (error) {
    debug('getAllMA() Error: %o', error);
    throw error;
  }
}
