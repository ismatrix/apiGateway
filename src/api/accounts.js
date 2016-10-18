import createDebug from 'debug';
import Boom from 'boom';
import createIceBroker from 'sw-broker-ice';
import { funds as fundsDB } from '../config';

const debug = createDebug('api:accounts');

export async function getAccounts(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const fundConf = fundsDB.find(fund => fund.fundid === fundid);
    const iceBroker = createIceBroker(fundConf);

    const accounts = await iceBroker.queryAccounts();

    return { ok: true, accounts };
  } catch (error) {
    debug('getAccounts() Error: %o', error);
    throw error;
  }
}
