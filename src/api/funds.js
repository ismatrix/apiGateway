import createDebug from 'debug';
import Boom from 'boom';
import { fund as dbFund } from '../sw-mongodb-crud';

const debug = createDebug('api:funds');


export async function getFunds() {
  try {
    const funds = await dbFund.getMany();

    if (!funds.length > 0) throw Boom.notFound('Funds not found');

    return { ok: true, funds };
  } catch (error) {
    debug('getFunds() Error: %o', error);
    throw Boom.badImplementation('An internal server error occurred');
  }
}

export async function getFundById(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const fund = await dbFund.getOne({ fundid });

    if (!fund) throw Boom.notFound('Fund not found');

    return { ok: true, fund };
  } catch (error) {
    debug('getFund() Error: %o', error);
    throw error;
  }
}
