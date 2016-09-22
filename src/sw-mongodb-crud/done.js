/** @module sw-mongodb-crud/done */
import createDebug from 'debug';
import * as mongodb from '../mongodb';
import * as codemap from './codemap';

const debug = createDebug('sw-mongodb-crud:done');

/** The handle of DONE collection */
let CTPDONE;
let STDONE;
let DONE;

/**
 * init the handle of DONE collection.
 * @function
 */
async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    CTPDONE = smartwin.collection('CTPDONE');
    STDONE = smartwin.collection('STDONE');
    DONE = smartwin.collection('DONE');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}
/**
 * get done list from DONE collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} dones - done documents array.
 */
export async function getList(filter = {}, project = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { fundid: 1, tradingday: 1 };
    const dones = await DONE.find(query, project).sort(sort).toArray();

    return dones;
  } catch (error) {
    debug('getList() Error:', error);
  }
}
/**
 * get done list from CTPDONE collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} ctpdones - ctp done documents array.
 */
export async function getCTPList(filter = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { investorid: 1, tradingday: 1, updatedate: 1 };
    const project = { _id: 0 };
    const ctpdones = await CTPDONE.find(query, project).sort(sort).toArray();

    return ctpdones;
  } catch (error) {
    debug('getCTPList() Error:', error);
  }
}
/**
 * convert ctpdones to done
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} dones - done documents array.
 */
// export async function ctp2done(filter = {}) {
//
// }
/**
 * get done list from STDONE collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} stdone - sungard done documents array.
 */
export async function getSTList(filter = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { cell_id: 1, tradingday: 1, updatedate: 1 };
    const stdone = await STDONE.find(query).sort(sort).toArray();

    return stdone;
  } catch (error) {
    debug('getSTList() Error:', error);
  }
}

/**
 * convert stdone to done
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} dones - done documents array.
 */
// export async function st2done(filter = {}) {
// }

/**
 * 获取指定基金，有成交信息的最大的交易日”
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
    const maxtradingday = await DONE.aggregate([
      { $match: match },
      { $group: group },
    ]).toArray();

    return maxtradingday.length > 0 ? maxtradingday[0].maxtradingday : null;
  } catch (error) {
    debug('done.getMaxTradingday() Error: %o', error);
    throw error;
  }
}

/**
 * Obtain one done document object by Specified id.
 * @function
 * @param {string} fundid - unique id for done collection
 * @param {string} tradingday - unique id for done collection
 * @return {Array} dones - done document content.
 * example : { doneDoc }
 */
export async function get(fundid, tradingday = null) {
  try {
    await getDb();
    const query = { fundid };
    query.tradingday = !tradingday ? await getMaxTradingday(fundid, tradingday, true) : tradingday;
    const done = await DONE.findOne(query);

    return done;
  } catch (error) {
    debug('done.get() Error: %o', error);
    throw error;
  }
}

/**
 * 获取某基金账户的最后成交信息
 * @function
 * @param {string} fundid - 基金标识
 * @param {string} tradingday - 指定交易日，为null代表最后有成交的交易日
 * @return {Array} dones - done document content.
 * example : { doneDoc }
 */
export async function getLast(fundid, tradingday = null) {
  try {
    const done = await get(fundid, tradingday);
    return done;
  } catch (error) {
    debug('done.get() Error: %o', error);
    throw error;
  }
}


/**
 * insert  single or multiple done documents into done collection.
 * @function
 * @param {Array.} documents - done document content.
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function add(documents) {
  try {
    await getDb();

    const ret = await DONE.insertMany(documents);

    return ret.result;
  } catch (error) {
    debug('done.add() Error: %o', error);
    throw error;
  }
}
// /**
//  * update an done documents by Specified done id.
//  * @function
//  * @param {string} fundid - unique id for done collection
//  * @param {string} tradingday - unique id for done collection
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
//     const ret = await DONE.updateOne(
//       filter,
//       update,
//       options,
//     );
//
//     return ret.result;
//   } catch (error) {
//     debug('done.set() Error: %o', error);
//     throw error;
//   }
// }
// /**
//  * remove an done documents by Specified done id.
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
//     const ret = await DONE.deleteOne(filter);
//
//     return ret.result;
//   } catch (error) {
//     debug('done.remove() Error: %o', error);
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
    //   // db.CTPDONE.createIndex( { investorid: 1, tradingday: 1 ,updatedate: 1 } )
    //   // done.getCTPList
    //   const ctpdones = await getCTPList();
    //   debug('done.getCTPList:', ctpdones.length);
    // }
    // {
    //   // done.getList
    //   const dones = await getList({ fundid: '3000380', tradingday: '20160822' });
    //   debug('done.getList:', dones[0].positionslist.length,
    //   dones[0].positionslist
    //   .map(positionlist => `${positionlist.requestid},
    //    ${positionlist.updatedate},${positionlist.done.length}`));
    // }
    // {
    //   // // done.ctp2Position
    //   // const dones = await getCTPList({ investorid: { $in: ['gxwza', '3000380'] },
    //   // tradingday: { $gte: '20160801', $lte: '20160830' } });
    //   // debug('new dones %o', dones);
    //   const dones = await ctp2done({ investorid: { $in: ['3000380'] },
    //   tradingday: { $gte: '20160822', $lte: '20160822' } });
    //   // debug('new dones %o', dones);
    //   const retadd = await add(dones);
    //   debug('done.ctp2Position.add:', retadd);
    // }
    // {
    //   // covert all ctp
    //   const dones = await ctp2done();
    //   // debug('new dones %o', dones);
    //   const retadd = await add(dones);
    //   debug('done.ctp2Position.add:', retadd);
    // }
    // {
    //   // db.STDONE.createIndex( { cell_id: 1, tradingday: 1 ,updatedate: 1 } )
    //   // done.getSTList
    //   const storders = await getSTList();
    //   debug('done.getSTList:', storders.length);
    // }
    // {
    //   // st2done
    //   const dones = await st2done({ cell_id: { $in: ['1339', '1285'] },
    //   tradingday: { $gte: '20160820', $lte: '20160830' } });
    //   debug('new dones %o', dones);
    //   const retadd = await add(dones);
    //   debug('done.st2done.add:', retadd);
    // }
    // {
    //   // covert all sungard
    //   const dones = await st2done();
    //   // debug('new dones %o', dones);
    //   const retadd = await add(dones);
    //   debug('done.st2position.add:', retadd);
    // }
    // {
    //   // done.get
    //   const done = await get('3000767');
    //   debug('done.get', done.fundname);
    // }
    {
      // done.getLast
      const done = await getLast('3000380');
      debug('done.getLast', done.fundid, done.tradingday,
      done.done.map(o =>
      `${o.privateno},${o.instrumentid},${o.direction},${o.offsetflag},${o.tradetime},${o.volume},${o.price}`));
    }
    // {
    //   // done.add
    //   const retadd = await add([{ fundid: 'aaa', key1: 1, key2: 'fuck' },
    //   { fundid: 'bbb', key1: 1, key2: 'fuck' }]);
    //   debug('done.add', retadd);
    // }
    // {
    //   // done.set
    //   const retset = await set('aaa', { fundname: 'aaa1111', key2: 'fuckyou111' });
    //   debug('done.set', retset);
    // }
    // {
    //   // done.remove
    //   const retremove1 = await remove('aaa');
    //   debug('done.remove', retremove1);
    //   const retremove2 = await remove('bbb');
    //   debug('done.remove', retremove2);
    // }
    // //
    process.exit(0);
  } catch (error) {
    debug('done.runTest: %o', error);
  }
}
