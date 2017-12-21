import logger from 'sw-common';
import Boom from 'boom';
import { isNumber } from 'lodash';
import crud from 'sw-mongodb-crud';

export async function getFunds() {
  try {
    const filter = {};
    const projection = {};
    const funds = await crud.fund.getList(filter, projection);

    if (!funds.length > 0) throw Boom.notFound('Funds not found');

    return { ok: true, funds };
  } catch (error) {
    logger.error('getFunds(): %j', error);
    throw error;
  }
}

export async function getFund(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const fund = await crud.fund.get(fundid);

    if (!fund) throw Boom.notFound('Fund not found');

    return { ok: true, fund };
  } catch (error) {
    logger.error('getFund(): %j', error);
    throw error;
  }
}

export async function postFund(fundid, fund) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!fund) throw Boom.badRequest('Missing fund parameter');

    await crud.fund.set(fundid, fund);

    return { ok: true };
  } catch (error) {
    logger.error('postFund(): %j', error);
    throw error;
  }
}

export async function deleteFund(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    await crud.fund.remove(fundid);

    return { ok: true };
  } catch (error) {
    logger.error('deleteFund(): %j', error);
    throw error;
  }
}

export async function postEquity(fundid, tradingday, equity) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!equity) throw Boom.badRequest('Missing equity parameter');

    await crud.equity.add(fundid, tradingday, equity);

    return { ok: true };
  } catch (error) {
    logger.error('postEquity(): %j', error);
    throw error;
  }
}

export async function putEquity(fundid, tradingday, equity) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!equity) throw Boom.badRequest('Missing equity parameter');

    await crud.equity.set(fundid, tradingday, { equity });

    return { ok: true };
  } catch (error) {
    logger.error('putEquity(): %j', error);
    throw error;
  }
}

export async function deleteEquity(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await crud.equity.remove(fundid, tradingday);

    return { ok: true };
  } catch (error) {
    logger.error('deleteEquity(): %j', error);
    throw error;
  }
}

export async function getTotal(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const total = await crud.equity.getTotal(fundid, tradingday);

    return { ok: true, total };
  } catch (error) {
    logger.error('getTotal(): %j', error);
    throw error;
  }
}

export async function getNetValue(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const netValues = await crud.equity.getNetValues(fundid, tradingday);

    return { ok: true, netValues };
  } catch (error) {
    logger.error('getNetValue(): %j', error);
    throw error;
  }
}

export async function getReturnByDateRange(fundid, beginDate, endDate) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!beginDate) throw Boom.badRequest('Missing beginDate parameter');
    if (!endDate) throw Boom.badRequest('Missing endDate parameter');

    logger.debug('fundid %j  beginDate %j endDate %j', fundid, beginDate, endDate);
    const returnReport = await crud.equity.getReturnsByRange(fundid, beginDate, endDate);
    logger.debug('returnReport %j', returnReport);

    return { ok: true, returnReport };
  } catch (error) {
    logger.error('getReturnByDateRange(): %j', error);
    throw error;
  }
}

export async function getNetValues(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const netLines = await crud.equity.getNetLines(fundid);

    return { ok: true, netLines };
  } catch (error) {
    logger.error('getNetValues(): %j', error);
    throw error;
  }
}

export async function getFixedIncomes(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const fixedIncomes = await crud.equity.getFixedIncomeList(fundid);

    return { ok: true, fixedIncomes };
  } catch (error) {
    logger.error('getFixedIncomes(): %j', error);
    throw error;
  }
}

export async function putFixedIncome(fundid, tradingday, fixedincome) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!fixedincome) throw Boom.badRequest('Missing fixedincome parameter');

    const result = await crud.equity.set(fundid, tradingday, { fixedincome });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    logger.error('putFixedIncome(): %j', error);
    throw error;
  }
}

export async function deleteFixedIncome(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await crud.equity.set(fundid, tradingday, { fixedincome: {} });

    return { ok: true };
  } catch (error) {
    logger.error('deleteFixedIncome(): %j', error);
    throw error;
  }
}

export async function getAppends(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const appends = await crud.equity.getAppendList(fundid);

    return { ok: true, appends };
  } catch (error) {
    logger.error('getAppends(): %j', error);
    throw error;
  }
}

export async function putAppend(fundid, tradingday, append) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!append) throw Boom.badRequest('Missing append parameter');

    const result = await crud.equity.set(fundid, tradingday, { append });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    logger.error('putAppend(): %j', error);
    throw error;
  }
}

export async function deleteAppend(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await crud.equity.set(fundid, tradingday, { append: {} });

    return { ok: true };
  } catch (error) {
    logger.error('deleteAppend(): %j', error);
    throw error;
  }
}

export async function getRedemptions(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const redemptions = await crud.equity.getRedemptionList(fundid);

    return { ok: true, redemptions };
  } catch (error) {
    logger.error('getRedemptions(): %j', error);
    throw error;
  }
}

export async function putRedemption(fundid, tradingday, redemption) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!redemption) throw Boom.badRequest('Missing redemption parameter');

    const result = await crud.equity.set(fundid, tradingday, { redemption });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    logger.error('putRedemption(): %j', error);
    throw error;
  }
}

export async function deleteRedemption(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await crud.equity.set(fundid, tradingday, { redemption: {} });

    return { ok: true };
  } catch (error) {
    logger.error('deleteRedemption(): %j', error);
    throw error;
  }
}

export async function getDividends(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const dividends = await crud.equity.getDividendList(fundid);

    return { ok: true, dividends };
  } catch (error) {
    logger.error('getFund(): %j', error);
    throw error;
  }
}

export async function putDividend(fundid, tradingday, dividend) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!dividend) throw Boom.badRequest('Missing dividend parameter');

    const result = await crud.equity.set(fundid, tradingday, { dividend });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    logger.error('putDividend(): %j', error);
    throw error;
  }
}

export async function deleteDividend(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await crud.equity.set(fundid, tradingday, { dividend: {} });

    return { ok: true };
  } catch (error) {
    logger.error('deleteDividend(): %j', error);
    throw error;
  }
}

export async function getCostOuts(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const costOuts = await crud.equity.getCostOutList(fundid);

    return { ok: true, costOuts };
  } catch (error) {
    logger.error('getCostOuts(): %j', error);
    throw error;
  }
}

export async function putFixedCost(fundid, tradingday, fixedcost) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!fixedcost) throw Boom.badRequest('Missing fixedcost parameter');

    const result = await crud.equity.set(fundid, tradingday, { fixedcost });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    logger.error('putFixedCost(): %j', error);
    throw error;
  }
}

export async function deleteFixedCost(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await crud.equity.set(fundid, tradingday, { fixedcost: { actual: 0, remark: '' } });

    return { ok: true };
  } catch (error) {
    logger.error('deleteFixedCost(): %j', error);
    throw error;
  }
}

export async function getHostingAccounts(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const hostingAccounts = await crud.equity.getHostingAccountList(fundid);

    return { ok: true, hostingAccounts };
  } catch (error) {
    logger.error('getHostingAccounts(): %j', error);
    throw error;
  }
}

export async function putHostingAccount(fundid, tradingday, hostingaccount) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!hostingaccount) throw Boom.badRequest('Missing hostingaccount parameter');

    const result = await crud.equity.set(fundid, tradingday, { hostingaccount });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    logger.error('putHostingAccount(): %j', error);
    throw error;
  }
}

export async function deleteHostingAccount(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await crud.equity.set(fundid, tradingday, { hostingaccount: { amount: 0, remark: '' } });

    return { ok: true };
  } catch (error) {
    logger.error('deleteHostingAccount(): %j', error);
    throw error;
  }
}

export async function getStockAccounts(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const stockAccounts = await crud.equity.getStockAccountList(fundid);

    return { ok: true, stockAccounts };
  } catch (error) {
    logger.error('getStockAccounts(): %j', error);
    throw error;
  }
}

export async function putStockAccount(fundid, tradingday, stockaccount) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!stockaccount) throw Boom.badRequest('Missing stockaccount parameter');

    const result = await crud.equity.set(fundid, tradingday, { stockaccount });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    logger.error('putStockAccount(): %j', error);
    throw error;
  }
}

export async function deleteStockAccount(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await crud.equity.set(fundid, tradingday, { stockaccount: { amount: 0, remark: '' } });

    return { ok: true };
  } catch (error) {
    logger.error('deleteStockAccount(): %j', error);
    throw error;
  }
}

export async function getBondAccounts(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const bondAccounts = await crud.equity.getBondAccountList(fundid);

    return { ok: true, bondAccounts };
  } catch (error) {
    logger.error('getBondAccounts(): %j', error);
    throw error;
  }
}

export async function putBondAccount(fundid, tradingday, bondaccount) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!bondaccount) throw Boom.badRequest('Missing bondaccount parameter');

    const result = await crud.equity.set(fundid, tradingday, { bondaccount });
    if (result.nModified === 0) throw Boom.badRequest('no matching record in DB');

    return { ok: true };
  } catch (error) {
    logger.error('putBondAccount(): %j', error);
    throw error;
  }
}

export async function deleteBondAccount(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    await crud.equity.set(fundid, tradingday, { stockaccount: { amount: 0, remark: '' } });

    return { ok: true };
  } catch (error) {
    logger.error('deleteBondAccount(): %j', error);
    throw error;
  }
}

export async function getDynamicEquity(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const dynamicEquity = await crud.equity.getDynamicEquity(fundid);

    return { ok: true, dynamicEquity };
  } catch (error) {
    logger.error('getDynamicEquity(): %j', error);
    throw error;
  }
}

export async function getTradingdays(fundid, tradingdayCount = 2) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!isNumber(tradingdayCount, 10)) throw Boom.badRequest('tradingdayCount is not a number');

    logger.debug('fundid %j tradingdayCount %j', fundid, tradingdayCount);

    const tradingdays = await crud.equity.getTradingdays(fundid, tradingdayCount);

    return { ok: true, tradingdays };
  } catch (error) {
    logger.error('getTradingdays(): %j', error);
    throw error;
  }
}

export async function getMaxTradingday() {
  try {
    const tradingday = await crud.tradingday.get();

    return { ok: true, tradingday };
  } catch (error) {
    logger.error('getMaxTradingday(): %j', error);
    throw error;
  }
}

export async function getPositionLevels(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const positionLevels = await crud.positionlevel.getLastInDay(fundid);

    return { ok: true, positionLevels };
  } catch (error) {
    logger.error('getPositionLevels(): %j', error);
    throw error;
  }
}
