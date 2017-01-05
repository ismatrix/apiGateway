import createDebug from 'debug';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

const debug = createDebug('app:api:trades');
const logError = createDebug('app:api:trades:error');
logError.log = console.error.bind(console);

export async function getTrades(fundid, tradingDay) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingDay) throw Boom.badRequest('Missing tradingDay parameter');

    const dbTrades = await crud.trade.getLast(fundid, tradingDay);

    if (dbTrades && dbTrades.done) {
      const trades = dbTrades.done;
      return { ok: true, trades };
    }

    return { ok: true, trades: [] };
  } catch (error) {
    logError('getTrades(): %o', error);
    throw error;
  }
}

export async function fake() {
  debug('no use');
}
