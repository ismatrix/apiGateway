import createDebug from 'debug';
import Boom from 'boom';
import { done as tradeDB } from 'sw-mongodb-crud';

const debug = createDebug('api:trades');

export async function getTrades(fundid, tradingDay) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingDay) throw Boom.badRequest('Missing tradingDay parameter');

    const dbTrades = await tradeDB.getLast(fundid, tradingDay);

    if (dbTrades && dbTrades.done) {
      const trades = dbTrades.done;
      return { ok: true, trades };
    }

    return { ok: true, trades: [] };
  } catch (error) {
    debug('getTrades() Error: %o', error);
    throw error;
  }
}

export async function fake() {
  debug('no use');
}
