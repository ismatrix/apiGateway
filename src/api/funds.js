import createDebug from 'debug';
import Boom from 'boom';
import {
  fund as fundDB,
  equity as equityDB,
} from 'sw-mongodb-crud';

const debug = createDebug('api:funds');


export async function getFunds() {
  try {
    const filter = {};
    const projection = {};
    const funds = await fundDB.getList(filter, projection);

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

export async function postEquity(fundid, tradingday, equity) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!equity) throw Boom.badRequest('Missing equity parameter');

    await equityDB.add(fundid, tradingday, equity);

    return { ok: true };
  } catch (error) {
    debug('postEquity() Error: %o', error);
    throw error;
  }
}

export async function putEquity(fundid, tradingday, equity) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!equity) throw Boom.badRequest('Missing equity parameter');

    await equityDB.set(fundid, tradingday, { equity });

    return { ok: true };
  } catch (error) {
    debug('putEquity() Error: %o', error);
    throw error;
  }
}

export async function deleteEquity(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await equityDB.remove(fundid, tradingday);

    return { ok: true };
  } catch (error) {
    debug('deleteEquity() Error: %o', error);
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

export async function getReturnByDateRange(fundid, beginDate, endDate) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!beginDate) throw Boom.badRequest('Missing beginDate parameter');
    if (!endDate) throw Boom.badRequest('Missing endDate parameter');

    debug('fundid %o  beginDate %o endDate %o', fundid, beginDate, endDate);
    const returnReport = await equityDB.getReturnsByRange(fundid, beginDate, endDate);
    debug('returnReport %o', returnReport);

    return { ok: true, returnReport };
  } catch (error) {
    debug('getReturnByDateRange() Error: %o', error);
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

export async function putFixedIncome(fundid, tradingday, fixedincome) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!fixedincome) throw Boom.badRequest('Missing fixedincome parameter');

    const result = await equityDB.set(fundid, tradingday, { fixedincome });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    debug('putFixedIncome() Error: %o', error);
    throw error;
  }
}

export async function deleteFixedIncome(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await equityDB.set(fundid, tradingday, { fixedincome: {} });

    return { ok: true };
  } catch (error) {
    debug('deleteFixedIncome() Error: %o', error);
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

export async function putAppend(fundid, tradingday, append) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!append) throw Boom.badRequest('Missing append parameter');

    const result = await equityDB.set(fundid, tradingday, { append });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    debug('putAppend() Error: %o', error);
    throw error;
  }
}

export async function deleteAppend(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await equityDB.set(fundid, tradingday, { append: {} });

    return { ok: true };
  } catch (error) {
    debug('deleteAppend() Error: %o', error);
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

export async function putRedemption(fundid, tradingday, redemption) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!redemption) throw Boom.badRequest('Missing redemption parameter');

    const result = await equityDB.set(fundid, tradingday, { redemption });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    debug('putRedemption() Error: %o', error);
    throw error;
  }
}

export async function deleteRedemption(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await equityDB.set(fundid, tradingday, { redemption: {} });

    return { ok: true };
  } catch (error) {
    debug('deleteRedemption() Error: %o', error);
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

export async function putDividend(fundid, tradingday, dividend) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!dividend) throw Boom.badRequest('Missing dividend parameter');

    const result = await equityDB.set(fundid, tradingday, { dividend });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    debug('putDividend() Error: %o', error);
    throw error;
  }
}

export async function deleteDividend(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await equityDB.set(fundid, tradingday, { dividend: {} });

    return { ok: true };
  } catch (error) {
    debug('deleteDividend() Error: %o', error);
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

export async function putFixedCost(fundid, tradingday, fixedcost) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!fixedcost) throw Boom.badRequest('Missing fixedcost parameter');

    const result = await equityDB.set(fundid, tradingday, { fixedcost });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    debug('putFixedCost() Error: %o', error);
    throw error;
  }
}

export async function deleteFixedCost(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await equityDB.set(fundid, tradingday, { fixedcost: { actual: 0, remark: '' } });

    return { ok: true };
  } catch (error) {
    debug('deleteFixedCost() Error: %o', error);
    throw error;
  }
}

export async function getHostingAccountAmounts(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const hostingAccountAmounts = await equityDB.getHostingAccountList(fundid);

    return { ok: true, hostingAccountAmounts };
  } catch (error) {
    debug('getHostingAccountAmounts() Error: %o', error);
    throw error;
  }
}

export async function getDynamicEquity(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const dynamicEquity = await equityDB.getDynamicEquity(fundid);

    return { ok: true, dynamicEquity };
  } catch (error) {
    debug('getDynamicEquity() Error: %o', error);
    throw error;
  }
}
