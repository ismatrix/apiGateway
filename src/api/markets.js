const debug = require('debug')('api:marketData');
import Boom from 'boom';
import * as mongodb from '../mongodb';
import { uniq, sortedIndex, sortedLastIndex } from 'lodash';
import * as icePast from '../sw-datafeed-icepast';
import through from 'through2';

let INDICATORS;
let INSTRUMENT;
let PRODUCT;
let DAYBAR;

(async function getDb() {
  const smartwin = await mongodb.getdb();
  INDICATORS = smartwin.collection('INDICATORS');
  INSTRUMENT = smartwin.collection('INSTRUMENT');
  PRODUCT = smartwin.collection('PRODUCT');
  DAYBAR = smartwin.collection('DAYBAR');
}());

export async function bullBearTrend(sym, startDate, endDate) {
  try {
    if (!sym || !startDate || !endDate) throw Boom.badRequest('Missing parameter');
    let symbols = sym;
    if (sym.includes('all')) {
      symbols = await INDICATORS.distinct('symbol', { name: 'bull bear trend' });
    }
    debug('bullBearTrend() req symbols %o', symbols);
    const queryIns = { instrumentid: { $in: symbols } };
    const projectionIns = { _id: 0, instrumentid: 1, instrumentname: 1 };
    const contracts = await INSTRUMENT.find(queryIns, projectionIns).toArray();

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
      const match = contracts.find((contract) => contract.instrumentid === indicator.symbol);
      if (match) indicator.name = match.instrumentname;
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
    debug('bullBearTrend() Error: %o', error);
    throw error;
  }
}

export async function contractDailyPriceSpeed(symbols) {
  try {
    if (!symbols) throw Boom.badRequest('Missing symbols parameter');

    const contractsQuery = { $and: [
        { istrading: 1 },
        { rank: { $in: [1, 2, 3] } },
        { $or: [{ productid: { $in: symbols } }, { instrumentid: { $in: symbols } }] },
    ] };
    const contractsProjection = { _id: 0, instrumentid: 1, productid: 1 };
    const contracts = await INSTRUMENT.find(contractsQuery, contractsProjection).toArray();
    const contractSymbols = contracts.map(contract => contract.instrumentid);
    debug('contractDailyPriceSpeed() contractSymbols: %o', contractSymbols);

    const query = { $and: [
      { symbol: { $in: contractSymbols } },
      { name: 'contract daily price speed' },
    ] };
    const projectionInd = { _id: 0, name: 0 };
    const indicators = await INDICATORS.find(query, projectionInd).toArray();

    if (!indicators[0]) throw Boom.notFound('Indicators not found');

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
      const match = contracts.find((contract) => contract.instrumentid === indicator.symbol);
      if (match) indicator.productSymbol = match.productid;
    }

    return { ok: true, timeline, indicators };
  } catch (error) {
    debug('contractDailyPriceSpeed() Error: %o', error);
    throw error;
  }
}

export async function getFuturesQuotes(symbol, resolution, startDate, endDate) {
  try {
    if (!symbol || !resolution || !startDate || !endDate) {
      throw Boom.badRequest('Missing parameter');
    }
    if (!['minute', 'day'].includes(resolution)) throw Boom.badRequest('Wrong resolution value');

    const op = '{"ok":true,"quotes":[';
    const sep = '\n,\n';
    const cl = ']}';
    let first = true;
    const stringifyIce = through.obj(
      (chunk, enc, callback) => {
        const json = JSON.stringify(chunk, null, 0);
        if (first) {
          first = false;
          callback(null, op.concat(json));
        } else callback(null, sep.concat(json));
      },
      function flush(callback) {
        this.push(cl);
        callback();
      }
    );
    let quotes;
    let transformFunction;
    if (resolution === 'minute') {
      quotes = await icePast.subscribe(symbol, resolution, startDate, endDate);

      transformFunction = (chunk, enc, callback) => {
        const candlestick = {
          timestamp: chunk.timestamp,
          open: chunk.open,
          high: chunk.high,
          low: chunk.low,
          close: chunk.close,
          volume: chunk.volume,
          tradingday: chunk.tradingDay,
        };
        callback(null, candlestick);
      };
    } else if (resolution === 'day') {
      const query = {
        $and: [
          { instrument: symbol },
          { tradingday: { $gte: startDate } },
          { tradingday: { $lte: endDate } },
        ],
      };

      quotes = await DAYBAR.find(query).sort({ tradingday: 1 }).stream();

      transformFunction = (chunk, enc, callback) => {
        const candlestick = {
          timestamp: parseInt(chunk.timestamp, 10),
          open: chunk.open,
          high: chunk.high,
          low: chunk.low,
          close: chunk.close,
          volume: chunk.volume,
          tradingDay: chunk.tradingday,
        };
        callback(null, candlestick);
      };
    }
    return quotes.pipe(through.obj(transformFunction))
    .pipe(stringifyIce);
  } catch (error) {
    debug('getFuturesQuotes() Error: %o', error);
    throw error;
  }
}

export async function getFuturesContracts(ranks, exchanges, symbols, productClasses, isTrading) {
  try {
    if (!ranks || !exchanges || !symbols || !productClasses || !isTrading) {
      throw Boom.badRequest('Missing parameter');
    }
    const query = {
      $and: [],
    };
    const lookup = {
      from: 'PRODUCT',
      localField: 'productid',
      foreignField: 'productid',
      as: 'product',
    };
    const unwind = '$product';
    debug('ranks: %o, exchanges: %o, symbols: %o, productClasses: %o, isTrading: %o',
    ranks, exchanges, symbols, productClasses, isTrading);

    if (!ranks.includes('all')) query.$and.push({ rank: { $in: ranks } });
    if (!exchanges.includes('all')) query.$and.push({ exchangeid: { $in: exchanges } });
    if (!symbols.includes('all')) {
      query.$and.push(
        { $or: [{ instrumentid: { $in: symbols } }, { productid: { $in: symbols } }] }
      );
    }
    if (!productClasses.includes('all')) query.$and.push({ productclass: { $in: productClasses } });
    if (!isTrading.includes('all')) query.$and.push({ istrading: { $in: isTrading } });
    if (!query.$and.length) delete query.$and;
    debug('getFuturesContracts() db query: %o', query);

    const projection = {
      _id: 0,
      instrumentid: 1,
      exchangeid: 1,
      instrumentname: {
        $cond:
        [
          { $or: [{ $eq: ['$productclass', '8'] }, { $eq: ['$productclass', '9'] }] },
          '$instrumentname',
           { $concat: ['$product.productname',
               { $substr: ['$expiredate', 2, 4] }] },
        ],
      },
      rank: 1,
      productclass: 1,
      productid: 1,
      istrading: 1,
    };

    const sort = { exchangeid: 1, productclass: -1, instrumentid: 1 };
    const contracts = await INSTRUMENT.aggregate([
      { $lookup: lookup },
      { $unwind: unwind },
      { $match: query },
      { $project: projection },
      { $sort: sort },
    ]).toArray();

    return { ok: true, contracts };
  } catch (error) {
    debug('getFuturesContracts() Error: %o', error);
    throw error;
  }
}

export async function getFuturesProducts() {
  try {
    const lookup = {
      from: 'INSTRUMENT',
      localField: 'productid',
      foreignField: 'productid',
      as: 'instrument',
    };
    const unwind = '$instrument';
    const match = { 'instrument.rank': 1 };
    const project = {
      _id: 0,
      productid: 1,
      productname: 1,
      exchangeid: 1,
      mainins: '$instrument.instrumentname',
      maininsopeninterest: '$instrument.openinterest',
    };
    const sort = { maininsopeninterest: -1 };
    const products = await PRODUCT.aggregate([
      { $lookup: lookup },
      { $unwind: unwind },
      { $match: match },
      { $project: project },
      { $sort: sort },
    ]).toArray();

    return { ok: true, products };
  } catch (error) {
    debug('getFuturesProducts() Error: %o', error);
    throw error;
  }
}

export async function getFuturesProductsByExchange() {
  try {
    const query = {};
    const projection = { _id: 0, productname: 1, exchangeid: 1, productid: 1 };
    const products = await PRODUCT.find(query, projection).toArray();

    const exchangesid = [...new Set(products.map(product => product.exchangeid))];
    debug('exchangesid %o', exchangesid);
    const productsByExchange = exchangesid.map(exchangeid => {
      const productsPerExchange = products.filter(
        product => !!(product.exchangeid === exchangeid)
      );
      debug('contractsPerExchange %o', productsPerExchange);
      const exchange = {
        exchangeid,
        products: productsPerExchange,
      };
      return exchange;
    });
    return { ok: true, productsByExchange };
  } catch (error) {
    debug('getFuturesProductsByExchange() Error: %o', error);
    throw error;
  }
}

export async function getLastTickSnapshot(symbols) {
  try {
    if (!symbols || symbols.length < 1) {
      throw Boom.badRequest('Missing instrument parameter');
    }
    const match = { instrument: { $in: symbols } };

    const sort = { tradingday: -1 };
    const group = {
      _id: '$instrument',
      maxtradingday: { $max: '$tradingday' },
      instrument: { $first: '$instrument' },
      tradingday: { $first: '$tradingday' },
      average: { $first: '$average' },
      close: { $first: '$close' },
      high: { $first: '$high' },
      low: { $first: '$low' },
      open: { $first: '$open' },
      openinterest: { $first: '$openinterest' },
      preclose: { $first: '$preclose' },
      preoopeninterest: { $first: '$preoopeninterest' },
      presettlement: { $first: '$presettlement' },
      settlement: { $first: '$settlement' },
      turnover: { $first: '$turnover' },
      volume: { $first: '$volume' },
    };

    const snapshot = await DAYBAR.aggregate([
      { $match: match },
      { $sort: sort },
      { $group: group },
    ]).toArray();

    return { ok: true, snapshot };
  } catch (error) {
    debug('getDayBar() Error: %o', error);
    throw error;
  }
}
