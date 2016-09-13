import createDebug from 'debug';
import Boom from 'boom';
import createIceBroker from '../sw-broker-ice';

const debug = createDebug('api:trades');

export async function getTrades(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const iceBroker = createIceBroker(fundid);

    const trades = await iceBroker.queryTrades();

    return { ok: true, trades };
  } catch (error) {
    debug('getTrades() Error: %o', error);
    throw error;
  }
}
