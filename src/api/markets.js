const debug = require('debug')('api:marketData');
import Boom from 'boom';
import * as mongodb from '../mongodb';
import { uniq, sortedIndex, sortedLastIndex } from 'lodash';
import * as icePast from '../sw-datafeed-icepast';
import through from 'through2';

let INDICATORS;
let INSTRUMENT;

(async function getDb() {
  const smartwin = await mongodb.getdb();
  INDICATORS = smartwin.collection('INDICATORS');
  INSTRUMENT = smartwin.collection('INSTRUMENT');
}());

export async function getIndicesTrend(sym, startDate, endDate) {
  try {
    if (!sym || !startDate || !endDate) throw Boom.badRequest('Missing parameter');
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
    timeline.reverse();
    for (const indicator of indicators) {
      indicator.values = indicator.values.slice(lowerIndex, upperIndex);
      indicator.values.reverse();
    }

    return { ok: true, timeline, indicators };
  } catch (error) {
    debug('getCandleStick() Error: %o', error);
    throw error;
  }
}

export async function getFuturesQuotes(symbol, resolution, startDate, endDate) {
  try {
    if (!symbol || !resolution || !startDate || !endDate) {
      throw Boom.badRequest('Missing parameter');
    }
    if (!['minute', 'day'].includes(resolution)) throw Boom.badRequest('Wrong resolution value');

    const quotes = await icePast.subscribe(symbol, resolution, startDate, endDate);
    return quotes.pipe(through.obj((chunk, enc, callback) => {
      const candlestick = {
        open: chunk.open,
        high: chunk.high,
        low: chunk.low,
        close: chunk.close,
      };
      callback(null, candlestick);
    }));
  } catch (error) {
    debug('getFuturesQuotes() Error: %o', error);
    throw error;
  }
}

export async function getFuturesContracts() {
  try {
    const query = {};
    const projection = { _id: 0, instrumentid: 1, exchangeid: 1, instrumentname: 1,
      exchangeinstid: 1,
    };
    const contracts = await INSTRUMENT.find(query, projection).toArray();
    return { ok: true, contracts };
  } catch (error) {
    debug('getAvg() Error: %o', error);
    throw error;
  }
}
