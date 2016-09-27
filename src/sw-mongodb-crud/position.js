/** @module sw-mongodb-crud/position */
import createDebug from 'debug';
import * as mongodb from '../mongodb';
import * as codemap from './codemap';

const debug = createDebug('sw-mongodb-crud:position');

/** The handle of POSITION collection */
let CTPPOSITION;
let STPOSITION;
let POSITION;

/**
 * init the handle of POSITION collection.
 * @function
 */
async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    CTPPOSITION = smartwin.collection('CTPPOSITION');
    STPOSITION = smartwin.collection('STPOSITION');
    POSITION = smartwin.collection('POSITION');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}
/**
 * get position list from POSITION collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} positions - position documents array.
 */
export async function getList(filter = {}, project = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { fundid: 1, tradingday: 1 };
    const positions = await POSITION.find(query, project).sort(sort).toArray();

    return positions;
  } catch (error) {
    debug('getList() Error:', error);
  }
}
/**
 * get position list from CTPPOSITION collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} ctppositions - ctp position documents array.
 */
export async function getCTPList(filter = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { investorid: 1, tradingday: 1, updatedate: 1 };
    const project = { _id: 0 };
    const ctppositions = await CTPPOSITION.find(query, project).sort(sort).toArray();

    return ctppositions;
  } catch (error) {
    debug('getCTPList() Error:', error);
  }
}
/**
 * convert ctppositions to position
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} positions - position documents array.
 */
export async function ctp2position(filter = {}) {
  try {
    let preInvestorId = null;
    let preTradingDay = null;

    let preRequestId = null;

    const positionTotalArray = [];
    let positionTotalDoc = {};

    let positionListDoc = {};

    const ctppositions = await getCTPList(filter);

    for (let i = 0; i < ctppositions.length; i++) {
      const positionItem = {};
      if (i % 5000 === 0) {
        debug('it has been %o lines', i);
      }
      if (ctppositions[i].investorid === preInvestorId
        && ctppositions[i].tradingday === preTradingDay) {
        // 同一组持仓
        if (ctppositions[i].requestid === preRequestId) {
          positionItem.instrumentid = ctppositions[i].instrumentid;
          positionItem.direction = await codemap.getKey('position.direction', 'ctp',
                Math.round(ctppositions[i].posidirection));
          positionItem.hedgeflag = await codemap.getKey('trade.hedge', 'ctp',
                Math.round(ctppositions[i].hedgeflag));
          positionItem.preposition = ctppositions[i].ydposition;
          positionItem.preholdposition = ctppositions[i].position - ctppositions[i].todayposition;
          positionItem.todayholdposition = ctppositions[i].todayposition;
          positionItem.position = ctppositions[i].position;
          positionItem.openvolume = ctppositions[i].openvolume;
          positionItem.closevolume = ctppositions[i].closevolume;
          positionItem.openamount = ctppositions[i].openamount;
          positionItem.closeamount = ctppositions[i].closeamount;
          positionItem.opencost = ctppositions[i].opencost;
          positionItem.positioncost = ctppositions[i].positioncost;
          positionItem.premargin = ctppositions[i].premargin;
          positionItem.margin = ctppositions[i].usemargin;
          positionItem.opencommission = ctppositions[i].commission;
          positionItem.closecommission = 0;
          positionItem.closeprofit = ctppositions[i].closeprofit;
          positionItem.positionprofit = ctppositions[i].positionprofit;
          positionItem.totalprofile = 0;

          positionListDoc.position.push(positionItem);
          // positionTotalDoc.positionslist.push(positionListDoc);
          // 如果到达最后一条，收尾
          if (i === ctppositions.length - 1) {
            positionTotalDoc.positionslist.push(positionListDoc);
            // debug('同一组持仓最后一条positionTotalDoc : %o, %o', i, positionTotalDoc);
            positionTotalArray.push(positionTotalDoc);
            debug('it has been over %o lines', i);
          }
        } else { // 不同组持仓
          // debug('不同requestid组持仓', preRequestId, ctppositions[i].requestid, positionListDoc);
          if (Object.keys(positionListDoc).length) {
            // positionTotalDoc.positionslist.push(positionListDoc);
          }
          positionListDoc = {};
          positionListDoc.requestid = ctppositions[i].requestid;
          positionListDoc.updatedate = ctppositions[i].updatedate;
          positionListDoc.position = [];
          positionItem.instrumentid = ctppositions[i].instrumentid;
          positionItem.direction = await codemap.getKey('position.direction', 'ctp',
                Math.round(ctppositions[i].posidirection));
          positionItem.hedgeflag = await codemap.getKey('trade.hedge', 'ctp',
                Math.round(ctppositions[i].hedgeflag));
          positionItem.preposition = ctppositions[i].ydposition;
          positionItem.preholdposition = ctppositions[i].position - ctppositions[i].todayposition;
          positionItem.todayholdposition = ctppositions[i].todayposition;
          positionItem.position = ctppositions[i].position;
          positionItem.openvolume = ctppositions[i].openvolume;
          positionItem.closevolume = ctppositions[i].closevolume;
          positionItem.openamount = ctppositions[i].openamount;
          positionItem.closeamount = ctppositions[i].closeamount;
          positionItem.opencost = ctppositions[i].opencost;
          positionItem.positioncost = ctppositions[i].positioncost;
          positionItem.premargin = ctppositions[i].premargin;
          positionItem.margin = ctppositions[i].usemargin;
          positionItem.opencommission = ctppositions[i].commission;
          positionItem.closecommission = 0;
          positionItem.closeprofit = ctppositions[i].closeprofit;
          positionItem.positionprofit = ctppositions[i].positionprofit;
          positionItem.totalprofile = 0;

          positionListDoc.position.push(positionItem);
          // positionTotalDoc.positionslist.push(positionListDoc);

          preRequestId = ctppositions[i].requestid;
          // 如果到达最后一条，收尾
          if (i === ctppositions.length - 1) {
            // debug('不同组持仓最后一条positionTotalDoc : %o, %o', i, positionTotalDoc);
            positionTotalDoc.positionslist.push(positionListDoc);
            positionTotalArray.push(positionTotalDoc);
            debug('it has been over %o lines', i);
          }
        }
      } else { // 不是同一天持仓
        if (Object.keys(positionTotalDoc).length) {
          // debug('不是同一天positionTotalDoc : %o, %o', i, positionTotalDoc);
          positionTotalArray.push(positionTotalDoc);
        }
        positionTotalDoc = {};
        positionTotalDoc.fundid = ctppositions[i].investorid;
        positionTotalDoc.tradingday = ctppositions[i].tradingday;
        positionTotalDoc.positionslist = [];

        positionItem.instrumentid = ctppositions[i].instrumentid;
        positionItem.direction = await codemap.getKey('position.direction', 'ctp',
              Math.round(ctppositions[i].posidirection));
        positionItem.hedgeflag = await codemap.getKey('trade.hedge', 'ctp',
              Math.round(ctppositions[i].hedgeflag));
        positionItem.preposition = ctppositions[i].ydposition;
        positionItem.preholdposition = ctppositions[i].position - ctppositions[i].todayposition;
        positionItem.todayholdposition = ctppositions[i].todayposition;
        positionItem.position = ctppositions[i].position;
        positionItem.openvolume = ctppositions[i].openvolume;
        positionItem.closevolume = ctppositions[i].closevolume;
        positionItem.openamount = ctppositions[i].openamount;
        positionItem.closeamount = ctppositions[i].closeamount;
        positionItem.opencost = ctppositions[i].opencost;
        positionItem.positioncost = ctppositions[i].positioncost;
        positionItem.premargin = ctppositions[i].premargin;
        positionItem.margin = ctppositions[i].usemargin;
        positionItem.opencommission = ctppositions[i].commission;
        positionItem.closecommission = 0;
        positionItem.closeprofit = ctppositions[i].closeprofit;
        positionItem.positionprofit = ctppositions[i].positionprofit;
        positionItem.totalprofile = 0;
        positionListDoc = {};
        positionListDoc.requestid = ctppositions[i].requestid;
        positionListDoc.updatedate = ctppositions[i].updatedate;
        positionListDoc.position = [];
        positionListDoc.position.push(positionItem);
        positionTotalDoc.positionslist.push(positionListDoc);

        preInvestorId = ctppositions[i].investorid;
        preTradingDay = ctppositions[i].tradingday;
        preRequestId = ctppositions[i].requestid;
        // 如果到达最后一条，收尾
        if (i === ctppositions.length - 1) {
          // debug('不是同一天最后一条positionTotalDoc : %o, %o', i, positionTotalDoc);
          positionTotalArray.push(positionTotalDoc);
          debug('it has been over %o lines', i);
        }
      }
    }
    return positionTotalArray;
  } catch (error) {
    debug('ctp2Position() Error:', error);
  }
}
/**
 * get position list from STPOSITION collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} staccounts - sungard position documents array.
 */
export async function getSTList(filter = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { cell_id: 1, tradingday: 1, updatedate: 1 };
    const staccounts = await STPOSITION.find(query).sort(sort).toArray();

    return staccounts;
  } catch (error) {
    debug('getSTList() Error:', error);
  }
}

/**
 * convert staccounts to position
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} positions - position documents array.
 */
export async function st2Position(filter = {}) {
  try {
    let preCellId = null;
    let preTradingDay = null;

    let preRequestId = null;

    const positionTotalArray = [];
    let positionTotalDoc = {};

    let positionListDoc = {};

    const stpositions = await getSTList(filter);

    for (let i = 0; i < stpositions.length; i++) {
      const positionItem = {};
      if (i % 5000 === 0) {
        debug('it has been %o lines', i);
      }
      if (stpositions[i].cell_id === preCellId
        && stpositions[i].tradingday === preTradingDay) {
        // 同一组持仓
        if (stpositions[i].requestid === preRequestId) {
          positionItem.instrumentid = stpositions[i].sec_code;
          positionItem.direction = await codemap.getKey('position.direction', 'sungard',
                Math.round(stpositions[i].posidirection));
          positionItem.hedgeflag = await codemap.getKey('trade.hedge', 'sungard',
                Math.round(stpositions[i].hedgingflag));
          positionItem.preposition = stpositions[i].pre_total_vol;
          positionItem.preholdposition = stpositions[i].pre_remain_vol;
          positionItem.todayholdposition = stpositions[i].total_vol - stpositions[i].pre_remain_vol;
          positionItem.position = stpositions[i].total_vol;
          positionItem.openvolume = stpositions[i].buy_vol;
          positionItem.closevolume = stpositions[i].sell_vol;
          positionItem.openamount = stpositions[i].buy_done_amt;
          positionItem.closeamount = stpositions[i].sell_done_amt;
          positionItem.opencost = Math.round(
            (stpositions[i].buy_done_amt / stpositions[i].buy_vol) * 100) / 100;
          positionItem.positioncost = Math.round(
            (stpositions[i].total_cost) * 100) / 100;
          positionItem.premargin = Math.round(
            (stpositions[i].yd_usemargin) * 100) / 100;
          positionItem.margin = Math.round(
            (stpositions[i].total_margin) * 100) / 100;
          positionItem.opencommission = Math.round(
            (stpositions[i].opencommission) * 100) / 100;
          positionItem.closecommission = Math.round(
            (stpositions[i].closecommission) * 100) / 100;
          positionItem.closeprofit = Math.round(
            (stpositions[i].realized_profit) * 100) / 100;
          positionItem.positionprofit = null;
          positionItem.totalprofile = 0;

          positionListDoc.position.push(positionItem);
          // positionTotalDoc.positionslist.push(positionListDoc);
          // 如果到达最后一条，收尾
          if (i === stpositions.length - 1) {
            positionTotalDoc.positionslist.push(positionListDoc);
            // debug('同一组持仓最后一条positionTotalDoc : %o, %o', i, positionTotalDoc);
            positionTotalArray.push(positionTotalDoc);
            debug('it has been over %o lines', i);
          }
        } else { // 不同组持仓
          // debug('不同requestid组持仓', preRequestId, stpositions[i].requestid, positionListDoc);
          if (Object.keys(positionListDoc).length) {
            // positionTotalDoc.positionslist.push(positionListDoc);
          }
          positionListDoc = {};
          positionListDoc.requestid = stpositions[i].requestid;
          positionListDoc.updatedate = stpositions[i].updatedate;
          positionListDoc.position = [];
          positionItem.instrumentid = stpositions[i].sec_code;
          positionItem.direction = await codemap.getKey('position.direction', 'sungard',
                Math.round(stpositions[i].posidirection));
          positionItem.hedgeflag = await codemap.getKey('trade.hedge', 'sungard',
                Math.round(stpositions[i].hedgingflag));
          positionItem.preposition = stpositions[i].pre_total_vol;
          positionItem.preholdposition = stpositions[i].pre_remain_vol;
          positionItem.todayholdposition = stpositions[i].total_vol - stpositions[i].pre_remain_vol;
          positionItem.position = stpositions[i].total_vol;
          positionItem.openvolume = stpositions[i].buy_vol;
          positionItem.closevolume = stpositions[i].sell_vol;
          positionItem.openamount = stpositions[i].buy_done_amt;
          positionItem.closeamount = stpositions[i].sell_done_amt;
          positionItem.opencost = Math.round(
            (stpositions[i].buy_done_amt / stpositions[i].buy_vol) * 100) / 100;
          positionItem.positioncost = Math.round(
            (stpositions[i].total_cost) * 100) / 100;
          positionItem.premargin = Math.round(
            (stpositions[i].yd_usemargin) * 100) / 100;
          positionItem.margin = Math.round(
            (stpositions[i].total_margin) * 100) / 100;
          positionItem.opencommission = Math.round(
            (stpositions[i].opencommission) * 100) / 100;
          positionItem.closecommission = Math.round(
            (stpositions[i].closecommission) * 100) / 100;
          positionItem.closeprofit = Math.round(
            (stpositions[i].realized_profit) * 100) / 100;
          positionItem.positionprofit = null;
          positionItem.totalprofile = 0;

          positionListDoc.position.push(positionItem);
          // positionTotalDoc.positionslist.push(positionListDoc);

          preRequestId = stpositions[i].requestid;
          // 如果到达最后一条，收尾
          if (i === stpositions.length - 1) {
            // debug('不同组持仓最后一条positionTotalDoc : %o, %o', i, positionTotalDoc);
            positionTotalDoc.positionslist.push(positionListDoc);
            positionTotalArray.push(positionTotalDoc);
            debug('it has been over %o lines', i);
          }
        }
      } else { // 不是同一天持仓
        if (Object.keys(positionTotalDoc).length) {
          // debug('不是同一天positionTotalDoc : %o, %o', i, positionTotalDoc);
          positionTotalArray.push(positionTotalDoc);
        }
        positionTotalDoc = {};
        positionTotalDoc.fundid = stpositions[i].cell_id;
        positionTotalDoc.tradingday = stpositions[i].tradingday;
        positionTotalDoc.positionslist = [];

        positionItem.instrumentid = stpositions[i].sec_code;
        positionItem.direction = await codemap.getKey('position.direction', 'sungard',
              Math.round(stpositions[i].posidirection));
        positionItem.hedgeflag = await codemap.getKey('trade.hedge', 'sungard',
              Math.round(stpositions[i].hedgingflag));
        positionItem.preposition = stpositions[i].pre_total_vol;
        positionItem.preholdposition = stpositions[i].pre_remain_vol;
        positionItem.todayholdposition = stpositions[i].total_vol - stpositions[i].pre_remain_vol;
        positionItem.position = stpositions[i].total_vol;
        positionItem.openvolume = stpositions[i].buy_vol;
        positionItem.closevolume = stpositions[i].sell_vol;
        positionItem.openamount = stpositions[i].buy_done_amt;
        positionItem.closeamount = stpositions[i].sell_done_amt;
        positionItem.opencost = Math.round(
          (stpositions[i].buy_done_amt / stpositions[i].buy_vol) * 100) / 100;
        positionItem.positioncost = Math.round(
          (stpositions[i].total_cost) * 100) / 100;
        positionItem.premargin = Math.round(
          (stpositions[i].yd_usemargin) * 100) / 100;
        positionItem.margin = Math.round(
          (stpositions[i].total_margin) * 100) / 100;
        positionItem.opencommission = Math.round(
          (stpositions[i].opencommission) * 100) / 100;
        positionItem.closecommission = Math.round(
          (stpositions[i].closecommission) * 100) / 100;
        positionItem.closeprofit = Math.round(
          (stpositions[i].realized_profit) * 100) / 100;
        positionItem.positionprofit = null;
        positionItem.totalprofile = 0;
        positionListDoc = {};
        positionListDoc.requestid = stpositions[i].requestid;
        positionListDoc.updatedate = stpositions[i].updatedate;
        positionListDoc.position = [];
        positionListDoc.position.push(positionItem);
        positionTotalDoc.positionslist.push(positionListDoc);

        preCellId = stpositions[i].cell_id;
        preTradingDay = stpositions[i].tradingday;
        preRequestId = stpositions[i].requestid;
        // 如果到达最后一条，收尾
        if (i === stpositions.length - 1) {
          // debug('不是同一天最后一条positionTotalDoc : %o, %o', i, positionTotalDoc);
          positionTotalArray.push(positionTotalDoc);
          debug('it has been over %o lines', i);
        }
      }
    }
    return positionTotalArray;
  } catch (error) {
    debug('st2Position() Error:', error);
  }
}

/**
 * 获取指定基金，有持仓的最大的交易日”
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
    const maxtradingday = await POSITION.aggregate([
      { $match: match },
      { $group: group },
    ]).toArray();

    return maxtradingday.length > 0 ? maxtradingday[0].maxtradingday : null;
  } catch (error) {
    debug('position.getMaxTradingday() Error: %o', error);
    throw error;
  }
}

/**
 * Obtain one position document object by Specified id.
 * @function
 * @param {string} fundid - unique id for position collection
 * @param {string} tradingday - unique id for position collection
 * @return {Array} positions - position document content.
 * example : { positionDoc }
 */
export async function get(fundid, tradingday = null) {
  try {
    await getDb();
    const query = { fundid };
    query.tradingday = await getMaxTradingday(fundid, tradingday, true);
    const position = await POSITION.findOne(query);

    return position;
  } catch (error) {
    debug('position.get() Error: %o', error);
    throw error;
  }
}

/**
 * 获取某基金账户的最新持仓
 * @function
 * @param {string} fundid - 基金标识
 * @param {string} tradingday - 指定交易日，为null代表最后交易日
 * @return {Array} positions - position document content.
 * example : { positionDoc }
 */
export async function getLast(fundid, tradingday = null) {
  try {
    const lastPosition = {};
    const position = await get(fundid, tradingday);
    if (position) {
      lastPosition.tradingday = position.tradingday;
      lastPosition.fundid = position.fundid;
      lastPosition.positionslist = position.positionslist.length > 0 ?
      position.positionslist[position.positionslist.length - 1] : {};
    }
    return lastPosition;
  } catch (error) {
    debug('position.get() Error: %o', error);
    throw error;
  }
}


/**
 * insert  single or multiple position documents into position collection.
 * @function
 * @param {Array.} documents - position document content.
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function add(documents) {
  try {
    await getDb();

    const ret = await POSITION.insertMany(documents);

    return ret.result;
  } catch (error) {
    debug('position.add() Error: %o', error);
    throw error;
  }
}
// /**
//  * update an position documents by Specified position id.
//  * @function
//  * @param {string} fundid - unique id for position collection
//  * @param {string} tradingday - unique id for position collection
//  * @param {Object} keyvalue - The modifications to apply
//  * @return {Object} result - return value and count for update.
//  * example : { ok: 1, nModified: 1, n: 1 }
//  */
// export async function set(fundid, tradingday, keyvalue) {
//   try {
//     await getDb();
//
//     const filter = { fundid, tradingday };
//     const update = {
//       $set: keyvalue,
//       $currentDate: { updatedate: true },
//     };
//     const options = {
//       upsert: true,
//     };
//     const ret = await POSITION.updateOne(
//       filter,
//       update,
//       options,
//     );
//
//     return ret.result;
//   } catch (error) {
//     debug('position.set() Error: %o', error);
//     throw error;
//   }
// }
// /**
//  * remove an position documents by Specified position id.
//  * @function
//  * @param {string} fundid - unique id for product collection
//  * @param {string} tradingday - unique id for product collection
//  * @return {Object} result - return value and count for removed.
//  * example : { ok: 1, n: 5 }
//  */
// export async function remove(fundid, tradingday) {
//   try {
//     await getDb();
//     const filter = { fundid, tradingday };
//     const ret = await POSITION.deleteOne(filter);
//
//     return ret.result;
//   } catch (error) {
//     debug('position.remove() Error: %o', error);
//     throw error;
//   }
// }

/**
 * an test function.
 * @function
 */
export async function runTest() {
  try {
    // {
    //   // db.CTPPOSITION.createIndex( { investorid: 1, tradingday: 1 ,updatedate: 1 } )
    //   // position.getCTPList
    //   const ctppositions = await getCTPList();
    //   debug('position.getCTPList:', ctppositions.length);
    // }
    // {
    //   // position.getList
    //   const positions = await getList({ fundid: '3000380', tradingday: '20160822' });
    //   debug('position.getList:', positions[0].positionslist.length,
    //   positions[0].positionslist
    //   .map(positionlist => `${positionlist.requestid},
    //    ${positionlist.updatedate},${positionlist.position.length}`));
    // }
    // {
    //   // // position.ctp2Position
    //   // const positions = await getCTPList({ investorid: { $in: ['gxwza', '3000380'] },
    //   // tradingday: { $gte: '20160801', $lte: '20160830' } });
    //   // debug('new positions %o', positions);
    //   const positions = await ctp2position({ investorid: { $in: ['3000380'] },
    //   tradingday: { $gte: '20160822', $lte: '20160822' } });
    //   // debug('new positions %o', positions);
    //   const retadd = await add(positions);
    //   debug('position.ctp2Position.add:', retadd);
    // }
    // {
    //   // covert all ctp
    //   const positions = await ctp2position();
    //   // debug('new positions %o', positions);
    //   const retadd = await add(positions);
    //   debug('position.ctp2Position.add:', retadd);
    // }
    // {
    //   // db.STPOSITION.createIndex( { cell_id: 1, tradingday: 1 ,updatedate: 1 } )
    //   // position.getSTList
    //   const stpositions = await getSTList();
    //   debug('position.getSTList:', stpositions.length);
    // }
    // {
    //   // st2Position
    //   const positions = await st2Position({ cell_id: { $in: ['1339', '1285'] },
    //   tradingday: { $gte: '20160820', $lte: '20160830' } });
    //   debug('new positions %o', positions);
    //   const retadd = await add(positions);
    //   debug('position.st2Position.add:', retadd);
    // }
    {
      // covert all sungard
      const positions = await st2Position();
      // debug('new positions %o', positions);
      const retadd = await add(positions);
      debug('position.st2position.add:', retadd);
    }
    // {
    //   // position.get
    //   const position = await get('3000767');
    //   debug('position.get', position.fundname);
    // }
    // {
    //   // position.getLast
    //   const position = await getLast('068074');
    //   debug('position.getLast', position.positionslist.position.length,
    //    position.tradingday, position.positionslist.position.map(p =>
    //     `${p.instrumentid},${p.direction},${p.hedgeflag},${p.position},
    //     ${p.openvolume},${p.closevolume}`));
    // }
    // {
    //   // position.add
    //   const retadd = await add([{ fundid: 'aaa', key1: 1, key2: 'fuck' },
    //   { fundid: 'bbb', key1: 1, key2: 'fuck' }]);
    //   debug('position.add', retadd);
    // }
    // {
    //   // position.set
    //   const retset = await set('aaa', { fundname: 'aaa1111', key2: 'fuckyou111' });
    //   debug('position.set', retset);
    // }
    // {
    //   // position.remove
    //   const retremove1 = await remove('aaa');
    //   debug('position.remove', retremove1);
    //   const retremove2 = await remove('bbb');
    //   debug('position.remove', retremove2);
    // }
    // //
    process.exit(0);
  } catch (error) {
    debug('position.runTest: %o', error);
  }
}
