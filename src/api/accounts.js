import createDebug from 'debug';
import Boom from 'boom';
// import createIceBroker from 'sw-broker-ice';
import {
  // funds as fundsDB,
  account as accountDB,
} from 'sw-mongodb-crud';

const debug = createDebug('api:accounts');

export async function getAccount(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const accounts = await accountDB.getLast(fundid);
    const account = accounts.account;

    return { ok: true, account };
  } catch (error) {
    debug('getAccounts() Error: %o', error);
    throw error;
  }
}
