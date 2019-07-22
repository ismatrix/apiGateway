import logger from 'sw-common';
import Boom from 'boom';
import through from 'through2';
import { uniq, sortedIndex, sortedLastIndex } from 'lodash';
import createGrpcClient from 'sw-grpc-client';
import grpc from 'grpc';
import crud from 'sw-mongodb-crud';
import config from '../config';

const smartwinMd = createGrpcClient({
  serviceName: 'smartwinFuturesMd',
  server: {
    ip: 'markets.quantowin.com',
    port: '50052',
  },
  jwtoken: config.jwtoken,
});

export async function bullBearTrend(sym, startDate, endDate) {
  try {
    if (!sym || !startDate || !endDate) throw Boom.badRequest('Missing parameter');
    let symbols = sym;

    if (sym.includes('all')) {
      const key = 'symbol';
      const query = { name: 'bull bear trend' };
      symbols = await crud.indicators.distinct(key, query);
    }

    logger.debug('bullBearTrend() req symbols %j', symbols);

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
    logger.error('bullBearTrend(): %j', error);
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
    logger.debug(contracts);
    const contractSymbols = contracts.map(contract => contract.instrumentid);
    logger.debug('contractDailyPriceSpeed() contractSymbols: %j', contractSymbols);

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
    logger.error('contractDailyPriceSpeed(): %j', error);
    throw error;
  }
}

export async function getFuturesQuotes({ symbol, resolution, startDate, endDate }, token) {
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
      },
    );

    const meta = new grpc.Metadata();
    meta.add('Authorization', token);
    let quotes;
    switch (resolution) {
      case 'day':
        quotes = smartwinMd.getPastDayBarStream({
          symbol,
          dataType: 'dayBar',
          resolution,
          startDate,
          endDate,
        }, meta);
        break;
      case 'snapshot':
        quotes = smartwinMd.getPastTickerStream({
          symbol,
          dataType: 'ticker',
          resolution,
          startDate,
          endDate,
        }, meta);
        break;
      default:
        quotes = smartwinMd.getPastBarStream({
          symbol,
          dataType: 'bar',
          resolution,
          startDate,
          endDate,
        }, meta);
        break;
    }

    return quotes.pipe(stringifyIce);
  } catch (error) {
    logger.error('getFuturesQuotes(): %j', error);
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
    logger.error('getFuturesContracts(): %j', error);
    throw error;
  }
}

export async function getFuturesProducts() {
  try {
    const products = await crud.product.getList();

    return { ok: true, products };
  } catch (error) {
    logger.error('getFuturesProducts(): %j', error);
    throw error;
  }
}

export async function getFuturesProductsByExchange() {
  try {
    const products = await crud.product.getList();

    const exchangesid = [...new Set(products.map(product => product.exchangeid))];
    logger.debug('exchangesid %j', exchangesid);
    const productsByExchange = exchangesid.map((exchangeid) => {
      const productsPerExchange = products.filter(
        product => !!(product.exchangeid === exchangeid),
      );
      logger.debug('contractsPerExchange %j', productsPerExchange);
      const exchange = {
        exchangeid,
        products: productsPerExchange,
      };
      return exchange;
    });
    return { ok: true, productsByExchange };
  } catch (error) {
    logger.error('getFuturesProductsByExchange(): %j', error);
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
    logger.error('getDayBar(): %j', error);
    throw error;
  }
}

export async function getSymbolsInBidaskByTradingday(tradingday) {
  try {
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const symbols = await crud.bidask.getSymbolsByTradingday(tradingday);

    return { ok: true, symbols };
  } catch (error) {
    logger.error('getSymbolsInBidaskByTradingday(): %j', error);
    throw error;
  }
}

export async function getBidAsk(tradingday, symbol) {
  try {
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!symbol) throw Boom.badRequest('Missing symbol parameter');

    const bidask = await crud.bidask.get(tradingday, symbol);

    return { ok: true, bidask };
  } catch (error) {
    logger.error('getBidAsk(): %j', error);
    throw error;
  }
}

export async function getSymbolsInBigorderByTradingday(tradingday) {
  try {
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const symbols = await crud.mdbigorder.getSymbolsByTradingday(tradingday);

    return { ok: true, symbols };
  } catch (error) {
    logger.error('getSymbolsInBigorderByTradingday(): %j', error);
    throw error;
  }
}

export async function getBigorder(symbol, tradingday) {
  try {
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!symbol) throw Boom.badRequest('Missing symbol parameter');

    const bigorder = await crud.mdbigorder.get(symbol, tradingday);

    return { ok: true, bigorder };
  } catch (error) {
    logger.error('getBidAsk(): %j', error);
    throw error;
  }
}

export async function getSpotDatas(id, startDate, endDate) {
  try {
    if (!id) throw Boom.badRequest('Missing spot id parameter');

    const spotdatas = await crud.spotdata.getList(id, startDate, endDate);

    return { ok: true, spotdatas };
  } catch (error) {
    logger.error('getSpotDatas(): %j', error);
    throw error;
  }
}
export async function getSpotTitle() {
  try {
    const spottitle = await crud.spotdata.getTitle();

    return { ok: true, spottitle };
  } catch (error) {
    logger.error('getSpotTitle(): %j', error);
    throw error;
  }
}

export async function getWildcard(tablename, query = {}, projection = {}) {
  try {
    if (!tablename) throw Boom.badRequest('Missing tablename parameter');

    const wildcards = await crud.wildcard.getList(tablename, query, projection);

    return { ok: true, wildcards };
  } catch (error) {
    logger.error('%j getWildcard(): %j', tablename, error);
    throw error;
  }
}

export async function removeWildcard(tablename, filter) {
  try {
    if (!tablename) throw Boom.badRequest('Missing tablename parameter');
    if (!filter) throw Boom.badRequest('Missing filter parameter');

    const wildcards = await crud.wildcard.remove(tablename, filter);

    return { ok: true, wildcards };
  } catch (error) {
    logger.error('%j removeWildcard(): %j', tablename, error);
    throw error;
  }
}

export async function upsertWildcard(tablename, filter, setObject) {
  try {
    if (!tablename) throw Boom.badRequest('Missing tablename parameter');
    if (!filter) throw Boom.badRequest('Missing filter parameter');
    if (!setObject) throw Boom.badRequest('Missing setObject parameter');

    const wildcards = await crud.wildcard.upsert(tablename, filter, setObject);

    return { ok: true, wildcards };
  } catch (error) {
    logger.error('%j upsertWildcard(): %j', tablename, error);
    throw error;
  }
}
