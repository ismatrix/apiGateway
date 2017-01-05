import createDebug from 'debug';
import Boom from 'boom';
import through from 'through2';
import { uniq, sortedIndex, sortedLastIndex } from 'lodash';
import createIcePastDataFeed from 'sw-datafeed-icepast';
import crud from 'sw-mongodb-crud';

const debug = createDebug('app:api:market');
const logError = createDebug('app:api:market:error');
logError.log = console.error.bind(console);

export async function bullBearTrend(sym, startDate, endDate) {
  try {
    if (!sym || !startDate || !endDate) throw Boom.badRequest('Missing parameter');
    let symbols = sym;

    if (sym.includes('all')) {
      const key = 'symbol';
      const query = { name: 'bull bear trend' };
      symbols = await crud.indicators.distinct(key, query);
    }

    debug('bullBearTrend() req symbols %o', symbols);

    const instrumentOptions = {
      instruments: symbols,
    };
    const contracts = await crud.instrument.getList(instrumentOptions);

    const indicatorsOptions = {
      symbols,
      name: 'bull bear trend',
    };
    const indicators = await crud.indicators.getList(indicatorsOptions);

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
      const match = contracts.find(contract => contract.instrumentid === indicator.symbol);
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
    logError('bullBearTrend(): %o', error);
    throw error;
  }
}

export async function contractDailyPriceSpeed(symbols) {
  try {
    if (!symbols) throw Boom.badRequest('Missing symbols parameter');

    const options = {
      rank: [1, 2, 3],
      istrading: [1],
      product: symbols,
    };

    const contracts = await crud.instrument.getList(options);
    debug(contracts);
    const contractSymbols = contracts.map(contract => contract.instrumentid);
    debug('contractDailyPriceSpeed() contractSymbols: %o', contractSymbols);

    const indicatorsOptions = {
      symbols: contractSymbols,
      name: 'contract daily price speed',
    };
    const indicators = await crud.indicators.getList(indicatorsOptions);

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
      const match = contracts.find(contract => contract.instrumentid === indicator.symbol);
      if (match) indicator.productSymbol = match.productid;
    }

    return { ok: true, timeline, indicators };
  } catch (error) {
    logError('contractDailyPriceSpeed(): %o', error);
    throw error;
  }
}

export async function getFuturesQuotes(symbol, resolution, startDate, endDate) {
  try {
    if (!symbol || !resolution || !startDate || !endDate) {
      throw Boom.badRequest('Missing parameter');
    }

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
    let transformFunction;
    if (resolution === 'minute') {
      const quotes = await createIcePastDataFeed(symbol, resolution, startDate, endDate);

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

      return quotes.pipe(through.obj(transformFunction)).pipe(stringifyIce);
    } else if (resolution === 'day') {
      const options = {
        instruments: [symbol],
        startDate,
        endDate,
      };
      const dbQuotes = await crud.daybar.getList(options);
      const quotes = dbQuotes.map(quote => ({
        timestamp: parseInt(quote.timestamp, 10),
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        volume: quote.volume,
        tradingDay: quote.tradingday,
      }));
      return { ok: true, quotes };
    }
    throw Boom.badRequest('Wrong resolution value');
  } catch (error) {
    logError('getFuturesQuotes(): %o', error);
    throw error;
  }
}

export async function getFuturesContracts(options = {}) {
  try {
    if ('symbols' in options && !options.symbols.includes('all')) options.instruments = options.symbols;
    if ('products' in options && !options.products.includes('all')) options.product = options.products;
    if ('exchanges' in options && !options.exchanges.includes('all')) options.exchange = options.exchanges;
    if ('ranks' in options && !options.ranks.includes('all')) options.rank = options.ranks;
    if ('productClasses' in options && !options.productClasses.includes('all')) options.productclass = options.productClasses;
    if ('isTrading' in options && !options.isTrading.includes('all')) options.istrading = options.isTrading;

    const contracts = await crud.instrument.getList(options);

    return { ok: true, contracts };
  } catch (error) {
    logError('getFuturesContracts(): %o', error);
    throw error;
  }
}

export async function getFuturesProducts() {
  try {
    const products = await crud.product.getList();

    return { ok: true, products };
  } catch (error) {
    logError('getFuturesProducts(): %o', error);
    throw error;
  }
}

export async function getFuturesProductsByExchange() {
  try {
    const products = await crud.product.getList();

    const exchangesid = [...new Set(products.map(product => product.exchangeid))];
    debug('exchangesid %o', exchangesid);
    const productsByExchange = exchangesid.map((exchangeid) => {
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
    logError('getFuturesProductsByExchange(): %o', error);
    throw error;
  }
}

export async function getFuturesLastSnapshot(symbols) {
  try {
    if (!symbols || symbols.length < 1) {
      throw Boom.badRequest('Missing instrument parameter');
    }

    const lastSnapshot = await crud.daybar.getLast(symbols);

    return { ok: true, lastSnapshot };
  } catch (error) {
    logError('getDayBar(): %o', error);
    throw error;
  }
}
