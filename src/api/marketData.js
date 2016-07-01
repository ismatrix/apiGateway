const debug = require('debug')('api:marketData');
import Boom from 'boom';
import * as mongodb from '../mongodb';
import { uniq, sortedIndex, sortedLastIndex } from 'lodash';

let INDICATORS;

(async function getDb() {
  const smartwin = await mongodb.getdb();
  INDICATORS = smartwin.collection('INDICATORS');
}());

export async function getIndicesTrend(sym, startDate, endDate) {
  try {
    if (!sym || !startDate || !endDate) Boom.badRequest('Missing a parameter');
    let symbols = sym;
    if (sym.includes('all')) {
      symbols = await INDICATORS.distinct('symbol', { name: 'bull bear trend' });
    }
    debug('symbols %o', symbols);
    const query = { $and: [
      { symbol: { $in: symbols } },
      { name: 'bull bear trend' },
    ] };
    const projection = { _id: 0, name: 0 };
    const indicators = await INDICATORS.find(query, projection).toArray();
    let timeline = indicators[0].dates;
    for (const indicator of indicators) {
      timeline = uniq(timeline.concat(indicator.dates));
    }
    timeline.sort();

    for (const [index, date] of timeline.entries()) {
      for (const indicator of indicators) {
        if (!indicator.dates.includes(date)) {
          indicator.values.splice(index, 0, null);
        }
      }
    }
    for (const indicator of indicators) {
      delete indicator.dates;
    }
    const lowerIndex = sortedIndex(timeline, startDate);
    const upperIndex = sortedLastIndex(timeline, endDate);

    timeline = timeline.slice(lowerIndex, upperIndex);
    for (const indicator of indicators) {
      indicator.values = indicator.values.slice(lowerIndex, upperIndex);
    }
    debug('lowerIndex %o, upperIndex %o', lowerIndex, upperIndex);
    debug(sortedIndex([0, 1, 2, 3, 4, 5, 6], 0));
    debug(sortedIndex([0, 1, 2, 3, 4, 5, 6], 1));
    return { ok: true, timeline, indicators };
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
