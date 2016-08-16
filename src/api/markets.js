import createDebug from 'debug';
import Boom from 'boom';
import through from 'through2';
import { uniq, sortedIndex, sortedLastIndex } from 'lodash';
import createIcePastDataFeed from '../sw-datafeed-icepast';
import {
  product as dbProduct,
  daybar as dbDaybar,
  instrument as dbInstrument,
  indicators as dbIndicators,
} from '../sw-mongodb-crud';

const debug = createDebug('api:market');

export async function bullBearTrend(sym, startDate, endDate) {
  try {
    if (!sym || !startDate || !endDate) throw Boom.badRequest('Missing parameter');
    let symbols = sym;

    if (sym.includes('all')) {
      const key = 'symbol';
      const query = { name: 'bull bear trend' };
      symbols = await dbIndicators.distinct(key, query);
    }

    debug('bullBearTrend() req symbols %o', symbols);

    const instrumentOptions = {
      instruments: symbols,
    };
    const contracts = await dbInstrument.getList(instrumentOptions);

    const indicatorsOptions = {
      symbols,
      name: 'bull bear trend',
    };
    const indicators = await dbIndicators.getMany(indicatorsOptions);

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

    const options = {
      rank: [1, 2, 3],
      istrading: [1],
      instruments: symbols,
    };

    const contracts = await dbInstrument.getList(options);
    debug(contracts);
    const contractSymbols = contracts.map(contract => contract.instrumentid);
    debug('contractDailyPriceSpeed() contractSymbols: %o', contractSymbols);

    const indicatorsOptions = {
      symbols: contractSymbols,
      name: 'contract daily price speed',
    };
    const indicators = await dbIndicators.getMany(indicatorsOptions);

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
      quotes = await createIcePastDataFeed(symbol, resolution, startDate, endDate);

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
      const options = {
        instruments: [symbol],
        startDate,
        endDate,
      };
      const quotesCursor = await dbDaybar.getListCursor(options);
      quotes = quotesCursor.stream();

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

    const options = {};

    if (!ranks.includes('all')) options.rank = ranks;
    if (!exchanges.includes('all')) options.exchange = exchanges;
    if (!symbols.includes('all')) options.product = symbols;
    if (!productClasses.includes('all')) options.productclass = productClasses;
    if (!isTrading.includes('all')) options.istrading = isTrading;

    const contracts = await dbInstrument.getList(options);

    return { ok: true, contracts };
  } catch (error) {
    debug('getFuturesContracts() Error: %o', error);
    throw error;
  }
}

export async function getFuturesProducts() {
  try {
    const products = await dbProduct.getList();

    return { ok: true, products };
  } catch (error) {
    debug('getFuturesProducts() Error: %o', error);
    throw error;
  }
}

export async function getFuturesProductsByExchange() {
  try {
    const products = await dbProduct.getList();

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

export async function getFuturesLastSnapshot(symbols) {
  try {
    if (!symbols || symbols.length < 1) {
      throw Boom.badRequest('Missing instrument parameter');
    }

    const lastSnapshot = await dbDaybar.getLast(symbols);

    return { ok: true, lastSnapshot };
  } catch (error) {
    debug('getDayBar() Error: %o', error);
    throw error;
  }
}
