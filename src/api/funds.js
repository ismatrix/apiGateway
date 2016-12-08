import createDebug from 'debug';
import Boom from 'boom';
import { isNumber } from 'lodash';
import {
  fund as fundDB,
  equity as equityDB,
} from 'sw-mongodb-crud';

const debug = createDebug('app:api:funds');
const logError = createDebug('app:api:funds:error');
logError.log = console.error.bind(console);

export async function getFunds() {
  try {
    const filter = {};
    const projection = {};
    const funds = await fundDB.getList(filter, projection);

    if (!funds.length > 0) throw Boom.notFound('Funds not found');

    return { ok: true, funds };
  } catch (error) {
    logError('getFunds(): %o', error);
    throw error;
  }
}

export async function getFund(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const fund = await fundDB.get(fundid);

    if (!fund) throw Boom.notFound('Fund not found');

    return { ok: true, fund };
  } catch (error) {
    logError('getFund(): %o', error);
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
    logError('postFund(): %o', error);
    throw error;
  }
}

export async function deleteFund(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    await fundDB.remove(fundid);

    return { ok: true };
  } catch (error) {
    logError('deleteFund(): %o', error);
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
    logError('postEquity(): %o', error);
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
    logError('putEquity(): %o', error);
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
    logError('deleteEquity(): %o', error);
    throw error;
  }
}

export async function getTotal(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const total = await equityDB.getTotal(fundid, tradingday);

    return { ok: true, total };
  } catch (error) {
    logError('getTotal(): %o', error);
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
    logError('getNetValue(): %o', error);
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
    logError('getReturnByDateRange(): %o', error);
    throw error;
  }
}

export async function getNetValues(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const netLines = await equityDB.getNetLines(fundid);

    return { ok: true, netLines };
  } catch (error) {
    logError('getNetValues(): %o', error);
    throw error;
  }
}

export async function getFixedIncomes(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const fixedIncomes = await equityDB.getFixedIncomeList(fundid);

    return { ok: true, fixedIncomes };
  } catch (error) {
    logError('getFixedIncomes(): %o', error);
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
    logError('putFixedIncome(): %o', error);
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
    logError('deleteFixedIncome(): %o', error);
    throw error;
  }
}

export async function getAppends(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const appends = await equityDB.getAppendList(fundid);

    return { ok: true, appends };
  } catch (error) {
    logError('getAppends(): %o', error);
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
    logError('putAppend(): %o', error);
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
    logError('deleteAppend(): %o', error);
    throw error;
  }
}

export async function getRedemptions(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const redemptions = await equityDB.getRedemptionList(fundid);

    return { ok: true, redemptions };
  } catch (error) {
    logError('getRedemptions(): %o', error);
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
    logError('putRedemption(): %o', error);
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
    logError('deleteRedemption(): %o', error);
    throw error;
  }
}

export async function getDividends(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const dividends = await equityDB.getDividendList(fundid);

    return { ok: true, dividends };
  } catch (error) {
    logError('getFund(): %o', error);
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
    logError('putDividend(): %o', error);
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
    logError('deleteDividend(): %o', error);
    throw error;
  }
}

export async function getCostOuts(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const costOuts = await equityDB.getCostOutList(fundid);

    return { ok: true, costOuts };
  } catch (error) {
    logError('getCostOuts(): %o', error);
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
    logError('putFixedCost(): %o', error);
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
    logError('deleteFixedCost(): %o', error);
    throw error;
  }
}

export async function getHostingAccounts(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const hostingAccounts = await equityDB.getHostingAccountList(fundid);

    return { ok: true, hostingAccounts };
  } catch (error) {
    logError('getHostingAccounts(): %o', error);
    throw error;
  }
}

export async function putHostingAccount(fundid, tradingday, hostingaccount) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!hostingaccount) throw Boom.badRequest('Missing hostingaccount parameter');

    const result = await equityDB.set(fundid, tradingday, { hostingaccount });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    logError('putFixedCost(): %o', error);
    throw error;
  }
}

export async function deleteHostingAccount(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await equityDB.set(fundid, tradingday, { hostingaccount: { amount: 0, remark: '' } });

    return { ok: true };
  } catch (error) {
    logError('deleteFixedCost(): %o', error);
    throw error;
  }
}

export async function getDynamicEquity(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const dynamicEquity = await equityDB.getDynamicEquity(fundid);

    return { ok: true, dynamicEquity };
  } catch (error) {
    logError('getDynamicEquity(): %o', error);
    throw error;
  }
}

export async function getTradingdays(fundid, tradingdayCount = 2) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!isNumber(tradingdayCount, 10)) throw Boom.badRequest('tradingdayCount is not a number');

    debug('fundid %o tradingdayCount %o', fundid, tradingdayCount);

    const tradingdays = await equityDB.getTradingdays(fundid, tradingdayCount);

    return { ok: true, tradingdays };
  } catch (error) {
    logError('getTradingdays(): %o', error);
    throw error;
  }
}
