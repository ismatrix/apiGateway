import Boom from 'boom';
import crud from 'sw-mongodb-crud';
import logger from 'sw-common';


export async function getAccount(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    logger.info('fundid %j', fundid);

    const accounts = await crud.account.getLast(fundid);

    if (!accounts && !accounts.account) throw Boom.badRequest('Missing account in DB');

    const account = Object.assign(accounts, accounts.account);
    delete account.account;

    return { ok: true, account };
  } catch (error) {
    logger.error('getAccounts(): %j', error);
    throw error;
  }
}
