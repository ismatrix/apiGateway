import createDebug from 'debug';
import Boom from 'boom';
import {
  fund as fundDB,
  equity as equityDB,
} from '../sw-mongodb-crud';

const debug = createDebug('api:funds');


export async function getFunds() {
  try {
    const funds = await fundDB.getList();

    if (!funds.length > 0) throw Boom.notFound('Funds not found');

    return { ok: true, funds };
  } catch (error) {
    debug('getFunds() Error: %o', error);
    throw Boom.badImplementation('An internal server error occurred');
  }
}

export async function getFund(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const fund = await fundDB.get(fundid);

    if (!fund) throw Boom.notFound('Fund not found');

    return { ok: true, fund };
  } catch (error) {
    debug('getFund() Error: %o', error);
    throw error;
  }
}

export async function postFund(fundid, fund) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!fund) throw Boom.badRequest('Missing fund parameter');

    await fundDB.set(fundid, fund);

    return { ok: true };
  } catch (error) {
    debug('postFund() Error: %o', error);
    throw error;
  }
}

export async function deleteFund(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    await fundDB.remove(fundid);

    return { ok: true };
  } catch (error) {
    debug('deleteFund() Error: %o', error);
    throw error;
  }
}

export async function getTotal(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const total = await equityDB.getTotal(fundid, tradingday);

    return { ok: true, total };
  } catch (error) {
    debug('getTotal() Error: %o', error);
    throw error;
  }
}

export async function getNetValue(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const netValues = await equityDB.getNetValues(fundid, tradingday);

    return { ok: true, netValues };
  } catch (error) {
    debug('getNetValue() Error: %o', error);
    throw error;
  }
}

export async function getNetValues(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const netLines = await equityDB.getNetLines(fundid);

    return { ok: true, netLines };
  } catch (error) {
    debug('getNetValues() Error: %o', error);
    throw error;
  }
}

export async function getFixedIncomes(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const fixedIncomes = await equityDB.getFixedIncomeList(fundid);

    return { ok: true, fixedIncomes };
  } catch (error) {
    debug('getFixedIncomes() Error: %o', error);
    throw error;
  }
}

export async function getAppends(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const appends = await equityDB.getAppendList(fundid);

    return { ok: true, appends };
  } catch (error) {
    debug('getAppends() Error: %o', error);
    throw error;
  }
}

export async function getRedemptions(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const redemptions = await equityDB.getRedemptionList(fundid);

    return { ok: true, redemptions };
  } catch (error) {
    debug('getRedemptions() Error: %o', error);
    throw error;
  }
}

export async function getDividends(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const dividends = await equityDB.getDividendList(fundid);

    return { ok: true, dividends };
  } catch (error) {
    debug('getFund() Error: %o', error);
    throw error;
  }
}

export async function getCostOuts(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const costOuts = await equityDB.getCostOutList(fundid);

    return { ok: true, costOuts };
  } catch (error) {
    debug('getCostOuts() Error: %o', error);
    throw error;
  }
}
