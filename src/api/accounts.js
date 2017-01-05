import createDebug from 'debug';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

const debug = createDebug('app:api:accounts');
const logError = createDebug('app:api:accounts:error');
logError.log = console.error.bind(console);

export async function getAccount(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    debug('fundid %o', fundid);

    const accounts = await crud.account.getLast(fundid);

    if (!accounts && !accounts.account) throw Boom.badRequest('Missing account in DB');

    const account = Object.assign(accounts, accounts.account);
    delete account.account;

    return { ok: true, account };
  } catch (error) {
    logError('getAccounts(): %o', error);
    throw error;
  }
}
