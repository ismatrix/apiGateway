/** @module sw-mongodb-crud/equity */
import createDebug from 'debug';
import * as mongodb from '../mongodb';
import * as fund from './fund';

const debug = createDebug('sw-mongodb-crud:equity');

/** The handle of EQUITY collection */
let EQUITY;

/**
 * init the handle of EQUITY collection.
 * @function
 */
async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    EQUITY = smartwin.collection('EQUITY');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}
/**
 * get equity list from EQUITY collection.
 * @function
 * @param {Object} filter - 过滤条件，空则返回所有记录
 * @param {Object} project - 返回的字段，空则返回所有
 * @return {Array} equitys - [{equityDoc1}, {equityDoc1}]
 */
export async function getList(filter, project) {
  try {
    await getDb();

    const query = filter;
    const sort = { fundid: 1, tradingday: 1 };

    const equitys = await EQUITY.find(query, project).sort(sort).toArray();

    return equitys;
  } catch (error) {
    debug('getList() Error:', error);
  }
}

/**
 * 获取指定基金的”固定收益存款列表“
 * @function
 * @param {string} fundid
 * @return {Array} History FixedIncome List
 */
export async function getFixedIncomeList(fundid) {
  try {
    const filter = { fundid, 'fixedincome.amount': { $ne: 0 } };
    const project = { _id: 0, tradingday: 1, 'fixedincome.amount': 1 };
    const total = await getList(filter, project);
    return total;
  } catch (error) {
    debug('equity.getFixedIncomeList() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金的”申购追加信息列表“
 * @function
 * @param {string} fundid
 * @return {Array} History Appended List
 */
export async function getAppendList(fundid) {
  try {
    const filter = { fundid, 'append.share': { $ne: 0 } };
    const project = { _id: 0, tradingday: 1, append: 1 };
    const total = await getList(filter, project);
    return total;
  } catch (error) {
    debug('equity.getAppendList() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金的”赎回信息列表“
 * @function
 * @param {string} fundid
 * @return {Array} History Redemption List
 */
export async function getRedemptionList(fundid) {
  try {
    const filter = { fundid, 'redemption.amount': { $ne: 0 } };
    const project = { _id: 0, tradingday: 1, redemption: 1 };
    const total = await getList(filter, project);
    return total;
  } catch (error) {
    debug('equity.getRedemptionList() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金的”分红列表“
 * @function
 * @param {string} fundid
 * @return {Array} History Dividend List
 */
export async function getDividendList(fundid) {
  try {
    const filter = { fundid, 'dividend.amount': { $ne: 0 } };
    const project = { _id: 0, tradingday: 1, dividend: 1 };
    const total = await getList(filter, project);
    return total;
  } catch (error) {
    debug('equity.getDividendList() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金的”固定成本扣除列表“
 * @function
 * @param {string} fundid
 * @return {Array} History Dividend List
 */
export async function getCostOutList(fundid) {
  try {
    const filter = { fundid, 'fixedcost.actual': { $ne: 0 } };
    const project = { _id: 0, tradingday: 1, fixedcost: 1 };
    const total = await getList(filter, project);
    return total;
  } catch (error) {
    debug('equity.getCostOutList() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金，最大的交易日”
 * @function
 * @param {string} fundid - 基金ID
 * @param {string} tradingday - 交易日 ，为null，返回最大交易日，否则返回小于tradingday的最大交易日
 * @param {string} f - 标识 最大交易日是否包含当前输入的交易日
 * @return {string} max tradingday - 返回最大的交易日.
 */
export async function getMaxTradingday(fundid, tradingday, f = null) {
  try {
    await getDb();
    const match = { fundid };
    if (tradingday) {
      match.tradingday = f ? { $lte: tradingday } : { $lt: tradingday };
    }
    const group = {
      _id: null,
      maxtradingday: { $max: '$tradingday' },
    };
    const maxtradingday = await EQUITY.aggregate([
      { $match: match },
      { $group: group },
    ]).toArray();

    return maxtradingday.length > 0 ? maxtradingday[0].maxtradingday : null;
  } catch (error) {
    debug('equity.getMaxTradingday() Error: %o', error);
    throw error;
  }
}

/**
 * Obtain one equity document object by Specified id.
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Array} equitys - equity document content.
 * example : { equityDoc }
 */
export async function get(fundid, iTradingday) {
  try {
    const tradingday = await getMaxTradingday(fundid, iTradingday, 1);
    await getDb();
    const query = { fundid, tradingday };
    const equity = await EQUITY.findOne(query);

    return equity;
  } catch (error) {
    debug('equity.get() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金、指定时间之前（包含指定时间）某一字段的总合计
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total - include count and data array.
 */
export async function getTotalByField(fundid, tradingday, field) {
  try {
    await getDb();
    const match = { fundid, tradingday: { $lte: tradingday } };
    // disctinct append.amount by append.share
    // 申购日资金并未进入交易户，append.amount持续补充到进入交易户日期
    if (field === 'append.amount') {
      match['append.share'] = { $gt: 0 };
    }
    const group = { _id: null, total: { $sum: `$${field}` } };
    const projection = { _id: 0, total: 1 };
    const total = await EQUITY.aggregate([
      { $match: match },
      { $group: group },
      { $project: projection },
    ]).toArray();

    return total.length > 0 ? total[0].total : 0;
  } catch (error) {
    debug('equity.getTotalByField() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的”固定收益存款金额合计“
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalFixedIncome(fundid, tradingday) {
  try {
    const total = await getTotalByField(fundid, tradingday, 'fixedincome.amount');
    return Math.round(total * 100) / 100;
  } catch (error) {
    debug('equity.getTotalAppend() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的”固定收益存款收益合计“
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalFixedIncomeReturns(fundid, tradingday) {
  try {
    const total = await getTotalByField(fundid, tradingday, 'fixedincome.returns');
    return Math.round(total * 100) / 100;
  } catch (error) {
    debug('equity.getTotalFixedIncomeReturns() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的“申购追加资金合计”
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalAppend(fundid, tradingday) {
  try {
    const total = await getTotalByField(fundid, tradingday, 'append.amount');
    return Math.round(total * 100) / 100;
  } catch (error) {
    debug('equity.getTotalAppend() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的“申购追加份额合计”
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalAppendShare(fundid, tradingday) {
  try {
    const total = await getTotalByField(fundid, tradingday, 'append.share');
    return Math.round(total * 100) / 100;
  } catch (error) {
    debug('equity.getTotalAppendShare() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的“赎回资金合计”
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalRedemption(fundid, tradingday) {
  try {
    const total = await getTotalByField(fundid, tradingday, 'redemption.amount');
    return Math.round(total * 100) / 100;
  } catch (error) {
    debug('equity.getTotalRedemption() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的“分红金额合计”
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalDividend(fundid, tradingday) {
  try {
    const total = await getTotalByField(fundid, tradingday, 'dividend.amount');
    return Math.round(total * 100) / 100;
  } catch (error) {
    debug('equity.getTotalDividend() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的“分红净值合计”
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalDividendNetValue(fundid, tradingday) {
  try {
    const total = await getTotalByField(fundid, tradingday, 'dividend.netvalue');
    return Math.round(total * 10000) / 10000;
  } catch (error) {
    debug('equity.getTotalDividendNetValue() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的“固定成本合计”
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalCost(fundid, tradingday) {
  try {
    const total = await get(fundid, tradingday);
    return Math.round(total.fixedcost.total * 100) / 100;
  } catch (error) {
    debug('equity.getTotalCost() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的“固定成本中的优先成本合计”
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalPriority(fundid, tradingday) {
  try {
    const total = await get(fundid, tradingday);
    return Math.round(total.fixedcost.priority * 100) / 100;
  } catch (error) {
    debug('equity.getTotalPriority() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的“固定成本中的管理费成本合计”
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalManagement(fundid, tradingday) {
  try {
    const total = await get(fundid, tradingday);
    return Math.round(total.fixedcost.management * 100) / 100;
  } catch (error) {
    debug('equity.getTotalManagement() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的“固定成本中的外包费成本合计”
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalOutsource(fundid, tradingday) {
  try {
    const total = await get(fundid, tradingday);
    return Math.round(total.fixedcost.outsource * 100) / 100;
  } catch (error) {
    debug('equity.getTotalOutsource() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的“固定成本中的托管费成本合计”
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalHosting(fundid, tradingday) {
  try {
    const total = await get(fundid, tradingday);
    return Math.round(total.fixedcost.hosting * 100) / 100;
  } catch (error) {
    debug('equity.getTotalHosting() Error: %o', error);
    throw error;
  }
}
/**
 * 获取指定基金截止到tradingay的“固定成本已被期货公司扣除合计”
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotalCostOut(fundid, tradingday) {
  try {
    const total = await getTotalByField(fundid, tradingday, 'fixedcost.actual');
    return Math.round(total * 100) / 100;
  } catch (error) {
    debug('equity.getTotalCostOut() Error: %o', error);
    throw error;
  }
}

/**
 * 获取指定基金截止到tradingay的所有固定成本
 * @function
 * @param {string} fundid - unique id for equity collection
 * @param {string} tradingday - unique tradingday for equity collection
 * @return {Number} total
 */
export async function getTotal(fundid, tradingday = '99999999') {
  try {
    const totalFixedIncome = await getTotalFixedIncome(fundid, tradingday);
    const totalFixedIncomeReturns = await getTotalFixedIncomeReturns(fundid, tradingday);
    const totalAppend = await getTotalAppend(fundid, tradingday);
    const totalAppendShare = await getTotalAppendShare(fundid, tradingday);
    const totalRedemption = await getTotalRedemption(fundid, tradingday);
    const totalDividend = await getTotalDividend(fundid, tradingday);
    const totalDividendNetValue = await getTotalDividendNetValue(fundid, tradingday);
    const totalCost = await getTotalCost(fundid, tradingday);
    const totalPriority = await getTotalPriority(fundid, tradingday);
    const totalManagement = await getTotalManagement(fundid, tradingday);
    const totalOutsource = await getTotalOutsource(fundid, tradingday);
    const totalHosting = await getTotalHosting(fundid, tradingday);
    const totalCostOut = await getTotalCostOut(fundid, tradingday);
    const total = {
      fixedincome: totalFixedIncome,
      fixedincomereturns: totalFixedIncomeReturns,
      append: totalAppend,
      appendshare: totalAppendShare,
      redemption: totalRedemption,
      dividend: totalDividend,
      dividendnetvalue: totalDividendNetValue,
      cost: totalCost,
      priority: totalPriority,
      management: totalManagement,
      outsource: totalOutsource,
      hosting: totalHosting,
      costout: totalCostOut,
    };
    return total;
  } catch (error) {
    debug('equity.getTotalCostOut() Error: %o', error);
    throw error;
  }
}

/**
 * 获取指定基金，指定tradingay的“前一天的字段值”
 * @function
 * @param {string} fundid - 基金ID
 * @param {string} tradingday - 交易日
 * @return {Number} values - 返回前一交易日指定字段值.
 */
export async function getPreVal(fundid, tradingday, field) {
  try {
    const preTradingday = await getMaxTradingday(fundid, tradingday);
    const equity = await get(fundid, preTradingday);
    return equity ? field.split('.').reduce((o, i) => o[i], equity) : null;
  } catch (error) {
    debug('equity.getPreVal() Error: %o', error);
    throw error;
  }
}

/**
 * 计算指定基金所有分红时刻的分红净值
 * @function
 * @param {string} fundid - 基金ID
 * @return {Array} netvalue - {fundid,tradingday,dividend.amount,netvalue}.
 */
export async function calcDividendNetValue(fundid) {
  try {
    const fundinfo = await fund.get(fundid);
    // 期初总权益
    const equityBeginning = fundinfo.equitybeginning;

    const dividendList = await getDividendList(fundid);
    for (let i = 0; i < dividendList.length; i++) {
      const appendShare = await getTotalAppendShare(fundid, dividendList[i].tradingday);
      dividendList[i].dividend.netvalue =
      dividendList[i].dividend.amount / (equityBeginning + appendShare);
      // debug('calcDividendNetValue %o, %o, %o',
      // fundid,
      // dividendList[i].dividend.amount,
      // equityBeginning + appendShare,
      // );
    }
    return dividendList;
  } catch (error) {
    debug('equity.getPreVal() Error: %o', error);
    throw error;
  }
}

/**
 * 获取指定基金某日净值
 * @function
 * @return {Object} netvalues - 参见EQUITY.getNetValues
 * example : {netvalueDoc}
 */
export async function getNetValues(fundid, iTradingday) {
  try {
    const tradingday = await getMaxTradingday(fundid, iTradingday, 1);
    const equity = await get(fundid, tradingday);
    const fundinfo = await fund.get(fundid);
    const structRatio = fundinfo.equityinferior > 0 ?
    Math.round((fundinfo.equitybeginning / fundinfo.equityinferior) * 100) / 100 : null;
    // 期初总权益
    const equityBeginning = fundinfo.equitybeginning;
    // 申购追加的份额
    const totalAppendShare = await getTotalAppendShare(fundid, tradingday);
    // 历史赎回的金额
    const totalRedemption = await getTotalRedemption(fundid, tradingday);

    // 固定收益金额
    const totalFixedIncome = await getTotalFixedIncome(fundid, tradingday);
    // 固定收益总收益
    const totalFixedIncomeReturns = await getTotalFixedIncomeReturns(fundid, tradingday);
    // 历史分红净值累积
    const totalDividendNetValue = await getTotalDividendNetValue(fundid, tradingday);
    // 总固定成本，优先＋管理费＋外包＋托管
    const totalCost = equity.fixedcost.total;
    // 总固定成本，实际扣除的
    const totalCostOut = await getTotalCostOut(fundid, tradingday);
    // 当日申购追加的金额
    const totalAppend = equity.append.amount;

    // debug('期初总权益 %o', equityBeginning);
    // debug('申购追加的份额 %o', totalAppendShare);
    // debug('历史赎回的金额 %o', totalRedemption);
    // debug('固定收益金额 %o', totalFixedIncome);
    // debug('固定收益总收益 %o', totalFixedIncomeReturns);
    // debug('历史分红净值累积 %o', totalDividendNetValue);
    // debug('总固定成本 %o', totalCost);
    // debug('总固定成本，实际扣除的 %o', totalCostOut);
    // debug('当日申购追加的金额 %o', totalAppend);

    const calcNetvalue = (x) => {
      if (!x) return null;
      const netvalue =
        (x
        + totalFixedIncome
        + totalFixedIncomeReturns
        + totalCostOut
        - totalCost
        + totalAppend) /
        (equityBeginning
        + totalAppendShare
        - totalRedemption);
      return Math.round(netvalue * 10000) / 10000;
    };

    const calcInferiorNetValue = (netvalue, ratio) => {
      if (!ratio) return null;
      return Math.round((1 + ((netvalue - 1) * ratio)) * 10000) / 10000;
    };

    const netvalues = {
      fundid,
      tradingday,
      equity: {
        last: equity.equity,
        open: equity.open,
        high: equity.high,
        low: equity.low,
        close: equity.close,
        settle: equity.settle,
      },
      netvalue: {
        last: calcNetvalue(equity.equity),
        open: calcNetvalue(equity.open),
        high: calcNetvalue(equity.high),
        low: calcNetvalue(equity.low),
        close: calcNetvalue(equity.close),
        settle: calcNetvalue(equity.settle),
        dividend: totalDividendNetValue,
        inferior: calcInferiorNetValue(calcNetvalue(equity.equity), structRatio),
      },
      updatedate: equity.updatedate,
    };
    return netvalues;
  } catch (error) {
    debug('equity.getNetValues() Error: %o', error);
    throw error;
  }
}

/**
 * 获取指定基金所有净值曲线信息
 * @function
 * @return {Array} netvalues - 参见EQUITY.getNetLines
 * example : [{netvalueDoc}, {netvalueDoc}]
 */
export async function getNetLines(fundid) {
  try {
    const netLines = [];
    const equityList = await getList({ fundid });
    const fundinfo = await fund.get(fundid);
    // 结构化劣后比例
    const structRatio = fundinfo.equityinferior > 0 ?
    Math.round((fundinfo.equitybeginning / fundinfo.equityinferior) * 100) / 100 : null;
    // 期初总权益
    const equityBeginning = fundinfo.equitybeginning;
    // 前一个净值
    let preLastNetValue = null;
    for (let i = 0; i < equityList.length; i++) {
      const equity = equityList[i];
      const tradingday = equity.tradingday;

      // 申购追加的份额
      const totalAppendShare = await getTotalAppendShare(fundid, tradingday);
      // 历史赎回的金额
      const totalRedemption = await getTotalRedemption(fundid, tradingday);

      // 固定收益金额
      const totalFixedIncome = await getTotalFixedIncome(fundid, tradingday);
      // 固定收益总收益
      const totalFixedIncomeReturns = await getTotalFixedIncomeReturns(fundid, tradingday);
      // 历史分红净值累积
      const totalDividendNetValue = await getTotalDividendNetValue(fundid, tradingday);
      // 总固定成本，优先＋管理费＋外包＋托管
      const totalCost = equity.fixedcost.total;
      // 总固定成本，实际扣除的
      const totalCostOut = await getTotalCostOut(fundid, tradingday);
      // 当日申购追加的金额
      const totalAppend = equity.append.amount;

      const calcNetvalue = (x) => {
        if (!x) return null;
        const netvalue =
          (x
          + totalFixedIncome
          + totalFixedIncomeReturns
          + totalCostOut
          - totalCost
          + totalAppend) /
          (equityBeginning
          + totalAppendShare
          - totalRedemption);
        return Math.round(netvalue * 10000) / 10000;
      };

      const calcInferiorNetValue = (netvalue, ratio) => {
        if (!ratio) return null;
        return Math.round((1 + ((netvalue - 1) * ratio)) * 10000) / 10000;
      };

      const netvalues = {
        fundid,
        tradingday,
        equity: {
          last: equity.equity,
          open: equity.open,
          high: equity.high,
          low: equity.low,
          close: equity.close,
          settle: equity.settle,
        },
        netvalue: {
          last: calcNetvalue(equity.equity),
          open: calcNetvalue(equity.open),
          high: calcNetvalue(equity.high),
          low: calcNetvalue(equity.low),
          close: calcNetvalue(equity.close),
          settle: calcNetvalue(equity.settle),
          dividend: totalDividendNetValue,
          inferior: calcInferiorNetValue(calcNetvalue(equity.equity), structRatio),
        },
        updatedate: equity.updatedate,
      };
      if (i === 0) {
        netvalues.netvalue.returns = 0;
        preLastNetValue = netvalues.netvalue.last + netvalues.netvalue.dividend;
      } else {
        netvalues.netvalue.returns =
        Math.round((netvalues.netvalue.last + netvalues.netvalue.dividend
          - preLastNetValue) * 10000) / 100;
        preLastNetValue = netvalues.netvalue.last + netvalues.netvalue.dividend;
      }
      netLines.push(netvalues);
    }

    return netLines;
  } catch (error) {
    debug('equity.getNetLines() Error: %o', error);
    throw error;
  }
}

/**
 * insert  single or multiple equity documents into equity collection.
 * @function
 * @param {Array.} documents - equity document content.
 * example : { fundDoc }
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function add(documents) {
  try {
    await getDb();

    const ret = await EQUITY.insertMany(documents);

    return ret.result;
  } catch (error) {
    debug('equity.add() Error: %o', error);
    throw error;
  }
}
/**
 * update an equity documents by Specified equity id.
 * @function
 * @param {string} fundid - unique id for equity collection
 * example : '1339'
 * @param {string} tradingday - unique id for equity collection
 * example : '20160428'
 * @param {Object} keyvalue - The modifications to apply
 * example : { key1: value1, key2: 'value2' })
 * @return {Object} result - return value and count for update.
 * example : { ok: 1, nModified: 1, n: 1 }
 */
export async function set(fundid, tradingday, keyvalue) {
  try {
    await getDb();

    const filter = { fundid, tradingday };
    const update = {
      $set: keyvalue,
      $currentDate: { updatedate: true },
    };
    const options = {
      upsert: true,
    };
    const ret = await EQUITY.updateOne(
      filter,
      update,
      options,
    );

    return ret.result;
  } catch (error) {
    debug('equity.set() Error: %o', error);
    throw error;
  }
}
/**
 * 更新指定基金所有分红时刻的分红净值
 * @function
 * @param {string} fundid - 基金ID
 * @return {Number} 0.
 */
export async function setDividendNetValue(fundid) {
  try {
    const dividendList = await calcDividendNetValue(fundid);
    const result = [];
    for (let i = 0; i < dividendList.length; i++) {
      // debug('setDividendNetValue %o, %o, %o',
      // fundid,
      // dividendList[i].tradingday,
      // dividendList[i].dividend.netvalue,
      // );
      const ret = await set(fundid, dividendList[i].tradingday,
        { 'dividend.netvalue': Math.round(dividendList[i].dividend.netvalue * 100) / 100 });
      result.push(ret);
    }
    return result;
  } catch (error) {
    debug('equity.setDividendNetValue() Error: %o', error);
    throw error;
  }
}
/**
 * 更新全部基金所有分红时刻的分红净值
 * @function
 * @param {string} fundid - 基金ID
 * @return {Number} 0.
 */
export async function setAllFundsDividendNetValue() {
  try {
    const fundList = await fund.getList();
    const result = [];
    for (let i = 0; i < fundList.length; i++) {
      // debug('setAllFundsDividendNetValue %o|%o ', fundList[i].fundid, fundList[i].fundname);
      const ret = await setDividendNetValue(fundList[i].fundid);
      result.push(ret);
    }
    return result;
  } catch (error) {
    debug('equity.setAllFundsDividendNetValue() Error: %o', error);
    throw error;
  }
}
/**
 * remove an equity documents by Specified equity id.
 * @function
 * @param {string} instrumentid - unique id for product collection
 * example : 'ru'
 * @return {Object} result - return value and count for removed.
 * example : { ok: 1, n: 5 }
 */
export async function remove(fundid, tradingday) {
  try {
    await getDb();
    const filter = { fundid, tradingday };
    const ret = await EQUITY.deleteOne(filter);

    return ret.result;
  } catch (error) {
    debug('equity.remove() Error: %o', error);
    throw error;
  }
}
/**
 * an test function.
 * @function
 */
export async function runTest() {
  try {
    // {
    //   // equity.getList
    //   const filter = { fundid: '1285' };
    //   const equitys = await getList(filter);
    //   debug('equity.getList:', equitys);
    // }
    // {
    //   // equity.getFixedIncomeList
    //   const equitys = await getFixedIncomeList('1285');
    //   debug('equity.getFixedIncomeList:', equitys);
    // }
    // {
    //   // equity.getAppendList
    //   const equitys = await getAppendList('80000528');
    //   debug('equity.getAppendList:', equitys);
    // }
    // {
    //   // equity.getDividendList
    //   const equitys = await getDividendList('3000380');
    //   debug('equity.getDividendList:', equitys);
    // }
    // {
    //   // equity.getCostOutList
    //   const equitys = await getCostOutList('1285');
    //   debug('equity.getCostOutList:', equitys);
    // }
    // {
    //   // equity.getMaxTradingday
    //   const maxtradingday = await getMaxTradingday('1285', '20160701');
    //   debug('equity.getMaxTradingday:', maxtradingday);
    // }
    // {
    //   // equity.getPreVal
    //   const equity = await getPreVal('1285', '20160822', 'close');
    //   debug('equity.getPreVal:', equity);
    // }
    // {
    //   // equity.getPreVal
    //   const equity = await getPreVal('1285', '20160701', 'fixedcost.remark');
    //   debug('equity.getPreVal:', equity);
    // }
    // {
    //   // equity.getNetValues
    //   const equity = await getNetValues('3000380', '20160701');
    //   debug('equity.getNetValues:', equity);
    // }
    // {
    //   // equity.getNetValues
    //   const equity = await getNetValues('1285', '20160822');
    //   debug('equity.getNetValues:', equity);
    // }
    // {
    //   // equity.getNetValues
    //   const equity = await getNetValues('1339', '20151124');
    //   debug('equity.getNetValues:', equity);
    // }
    // {
    //   // equity.getNetLines
    //   const equity = await getNetLines('1285');
    //   debug('equity.getNetLines:', equity);
    // }
    // {
    //   // equity.calcDividendNetValue
    //   const equity = await calcDividendNetValue('3000380');
    //   debug('equity.calcDividendNetValue:', equity);
    // }
    // {
    //   // equity.setDividendNetValue
    //   const ret = await setDividendNetValue('3000380');
    //   debug('equity.setDividendNetValue:', ret);
    // }
    // { // 数据迁移完毕之后执行
    //   // equity.setAllFundsDividendNetValue
    //   const ret = await setAllFundsDividendNetValue();
    //   debug('equity.setAllFundsDividendNetValue:', ret);
    // }
    // {
      // // equity.getTotalByField
      // const total = await getTotalByField('1339', '20151124', 'dividend.amount');
      // debug('equity.getTotalByField:', total);
      // const total = await getTotalByField('1339', '20160701', 'append.amount');
      // debug('equity.getTotalByField:', total);
    // }
    // {
    //   // equity.get
    //   const equity = await get('1285', '20160823');
    //   debug('equity.get', equity);
    // }
    // {
    //   // equity.getTotalPriority
    //   const total = await getTotalPriority('1285', '20160823');
    //   debug('equity.getTotalPriority', total);
    // }
    // {
    //   // equity.getTotalPriority
    //   const total = await getTotalDividend('3000380', '20160823');
    //   debug('equity.getTotalDividend', total);
    // }
    // {
    //   // equity.getTotal
    //   const total = await getTotal('800002', '20160823');
    //   debug('equity.getTotal', total);
    // }
    // {
    //   // equity.add
    //   const retadd = await add([{ fundid: 'aaa', key1: 1, key2: 'fuck' },
    //   { fundid: 'bbb', key1: 1, key2: 'fuck' }]);
    //   debug('equity.add', retadd);
    // }
    // {
    //   // equity.set
    //   const retset = await set('aaa', { fundname: 'aaa1111', key2: 'fuckyou111' });
    //   debug('equity.set', retset);
    // }
    // {
    //   // equity.remove
    //   const retremove1 = await remove('aaa');
    //   debug('equity.remove', retremove1);
    //   const retremove2 = await remove('bbb');
    //   debug('equity.remove', retremove2);
    // }
    // //
    process.exit(0);
  } catch (error) {
    debug('equity.runTest: %o', error);
  }
}
