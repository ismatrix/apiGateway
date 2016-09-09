import createDebug from 'debug';
import Boom from 'boom';
import createIceBroker from '../sw-broker-ice';

const debug = createDebug('api:accounts');

export async function getAccounts(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const iceBroker = createIceBroker(fundid);

    const accounts = await iceBroker.queryAccounts();

    return { ok: true, accounts };
  } catch (error) {
    debug('getAccounts() Error: %o', error);
    throw error;
  }
}
