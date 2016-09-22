/** @module sw-mongodb-crud/order */
import createDebug from 'debug';
import * as mongodb from '../mongodb';
import * as codemap from './codemap';

const debug = createDebug('sw-mongodb-crud:order');

/** The handle of ORDER collection */
let CTPORDER;
let STORDER;
let ORDER;

/**
 * init the handle of ORDER collection.
 * @function
 */
async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    CTPORDER = smartwin.collection('CTPORDER');
    STORDER = smartwin.collection('STORDER');
    ORDER = smartwin.collection('ORDER');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}
/**
 * get order list from ORDER collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} orders - order documents array.
 */
export async function getList(filter = {}, project = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { fundid: 1, tradingday: 1 };
    const orders = await ORDER.find(query, project).sort(sort).toArray();

    return orders;
  } catch (error) {
    debug('getList() Error:', error);
  }
}
/**
 * get order list from CTPORDER collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} ctporders - ctp order documents array.
 */
export async function getCTPList(filter = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { investorid: 1, tradingday: 1, updatedate: 1 };
    const project = { _id: 0 };
    const ctporders = await CTPORDER.find(query, project).sort(sort).toArray();

    return ctporders;
  } catch (error) {
    debug('getCTPList() Error:', error);
  }
}
/**
 * convert ctporders to order
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} orders - order documents array.
 */
// export async function ctp2order(filter = {}) {
//
// }
/**
 * get order list from STORDER collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} storder - sungard order documents array.
 */
export async function getSTList(filter = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { cell_id: 1, tradingday: 1, updatedate: 1 };
    const storder = await STORDER.find(query).sort(sort).toArray();

    return storder;
  } catch (error) {
    debug('getSTList() Error:', error);
  }
}

/**
 * convert storder to order
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} orders - order documents array.
 */
// export async function st2order(filter = {}) {
// }

/**
 * 获取指定基金，有委托的最大的交易日”
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
    const maxtradingday = await ORDER.aggregate([
      { $match: match },
      { $group: group },
    ]).toArray();

    return maxtradingday.length > 0 ? maxtradingday[0].maxtradingday : null;
  } catch (error) {
    debug('order.getMaxTradingday() Error: %o', error);
    throw error;
  }
}

/**
 * Obtain one order document object by Specified id.
 * @function
 * @param {string} fundid - unique id for order collection
 * @param {string} tradingday - unique id for order collection
 * @return {Array} orders - order document content.
 * example : { orderDoc }
 */
export async function get(fundid, tradingday = null) {
  try {
    await getDb();
    const query = { fundid };
    query.tradingday = !tradingday ? await getMaxTradingday(fundid, tradingday, true) : tradingday;
    const order = await ORDER.findOne(query);

    return order;
  } catch (error) {
    debug('order.get() Error: %o', error);
    throw error;
  }
}

/**
 * 获取某基金账户的最后委托信息
 * @function
 * @param {string} fundid - 基金标识
 * @param {string} tradingday - 指定交易日，为null代表最后有委托的交易日
 * @return {Array} orders - order document content.
 * example : { orderDoc }
 */
export async function getLast(fundid, tradingday = null) {
  try {
    const order = await get(fundid, tradingday);
    return order;
  } catch (error) {
    debug('order.get() Error: %o', error);
    throw error;
  }
}


/**
 * insert  single or multiple order documents into order collection.
 * @function
 * @param {Array.} documents - order document content.
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function add(documents) {
  try {
    await getDb();

    const ret = await ORDER.insertMany(documents);

    return ret.result;
  } catch (error) {
    debug('order.add() Error: %o', error);
    throw error;
  }
}
// /**
//  * update an order documents by Specified order id.
//  * @function
//  * @param {string} fundid - unique id for order collection
//  * @param {string} tradingday - unique id for order collection
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
//     const ret = await ORDER.updateOne(
//       filter,
//       update,
//       options,
//     );
//
//     return ret.result;
//   } catch (error) {
//     debug('order.set() Error: %o', error);
//     throw error;
//   }
// }
// /**
//  * remove an order documents by Specified order id.
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
//     const ret = await ORDER.deleteOne(filter);
//
//     return ret.result;
//   } catch (error) {
//     debug('order.remove() Error: %o', error);
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
    //   // db.CTPORDER.createIndex( { investorid: 1, tradingday: 1 ,updatedate: 1 } )
    //   // order.getCTPList
    //   const ctporders = await getCTPList();
    //   debug('order.getCTPList:', ctporders.length);
    // }
    // {
    //   // order.getList
    //   const orders = await getList({ fundid: '3000380', tradingday: '20160822' });
    //   debug('order.getList:', orders[0].positionslist.length,
    //   orders[0].positionslist
    //   .map(positionlist => `${positionlist.requestid},
    //    ${positionlist.updatedate},${positionlist.order.length}`));
    // }
    // {
    //   // // order.ctp2Position
    //   // const orders = await getCTPList({ investorid: { $in: ['gxwza', '3000380'] },
    //   // tradingday: { $gte: '20160801', $lte: '20160830' } });
    //   // debug('new orders %o', orders);
    //   const orders = await ctp2order({ investorid: { $in: ['3000380'] },
    //   tradingday: { $gte: '20160822', $lte: '20160822' } });
    //   // debug('new orders %o', orders);
    //   const retadd = await add(orders);
    //   debug('order.ctp2Position.add:', retadd);
    // }
    // {
    //   // covert all ctp
    //   const orders = await ctp2order();
    //   // debug('new orders %o', orders);
    //   const retadd = await add(orders);
    //   debug('order.ctp2Position.add:', retadd);
    // }
    // {
    //   // db.STORDER.createIndex( { cell_id: 1, tradingday: 1 ,updatedate: 1 } )
    //   // order.getSTList
    //   const storders = await getSTList();
    //   debug('order.getSTList:', storders.length);
    // }
    // {
    //   // st2order
    //   const orders = await st2order({ cell_id: { $in: ['1339', '1285'] },
    //   tradingday: { $gte: '20160820', $lte: '20160830' } });
    //   debug('new orders %o', orders);
    //   const retadd = await add(orders);
    //   debug('order.st2order.add:', retadd);
    // }
    // {
    //   // covert all sungard
    //   const orders = await st2order();
    //   // debug('new orders %o', orders);
    //   const retadd = await add(orders);
    //   debug('order.st2position.add:', retadd);
    // }
    // {
    //   // order.get
    //   const order = await get('3000767');
    //   debug('order.get', order.fundname);
    // }
    {
      // order.getLast
      const order = await getLast('1339');
      debug('order.getLast', order.fundid, order.tradingday,
      order.order.map(o =>
      `${o.privateno},${o.instrumentid},${o.direction},${o.offsetflag},${o.orderstatus},${o.volume},${o.volumetraded}`));
    }
    // {
    //   // order.add
    //   const retadd = await add([{ fundid: 'aaa', key1: 1, key2: 'fuck' },
    //   { fundid: 'bbb', key1: 1, key2: 'fuck' }]);
    //   debug('order.add', retadd);
    // }
    // {
    //   // order.set
    //   const retset = await set('aaa', { fundname: 'aaa1111', key2: 'fuckyou111' });
    //   debug('order.set', retset);
    // }
    // {
    //   // order.remove
    //   const retremove1 = await remove('aaa');
    //   debug('order.remove', retremove1);
    //   const retremove2 = await remove('bbb');
    //   debug('order.remove', retremove2);
    // }
    // //
    process.exit(0);
  } catch (error) {
    debug('order.runTest: %o', error);
  }
}
