import logger from 'sw-common';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

export async function getTrades(fundid, tradingDay) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingDay) throw Boom.badRequest('Missing tradingDay parameter');

    const dbTrades = await crud.done.getLast(fundid, tradingDay);

    if (dbTrades && dbTrades.done) {
      const trades = dbTrades.done;
      return { ok: true, trades };
    }

    return { ok: true, trades: [] };
  } catch (error) {
    logger.error('getTrades(): %j', error);
    throw error;
  }
}

export async function fake() {
  logger.debug('no use');
}
