import createDebug from 'debug';
import Boom from 'boom';
import {
  account as accountDB,
} from 'sw-mongodb-crud';

const debug = createDebug('api:accounts');

export async function getAccount(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const accounts = await accountDB.getLast(fundid);
    const account = Object.assign(accounts, accounts.account);
    delete account.account;

    return { ok: true, account };
  } catch (error) {
    debug('getAccounts() Error: %o', error);
    throw error;
  }
}
