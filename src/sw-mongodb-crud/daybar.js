/** @module sw-mongodb-crud/daybar */
import * as mongodb from '../mongodb';

const debug = require('debug')('sw-mongodb-crud:daybar');

/** The handle of DAYBAR collection */
let DAYBAR;

/**
 * init the handle of DAYBAR collection.
 * @function
 */
async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    DAYBAR = smartwin.collection('DAYBAR');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}

/**
 * get daybar list from DAYBAR collection.
 * @function
 * @param {Object} filter - Query filter documents
 * specify the conditions that determine which records to select for return
 * example : { instruments: ['IF1609','IF1701'], startDate: '20160701', endDate: '20160707' }
 * @return {Array} daybars - daybar array.
 * example : [{daybarDoc1}, {daybarDoc2}]
 */
export async function getList(filter) {
  try {
    await getDb();

    let instruments = [];
    let startDate = '0';
    let endDate = '99999999';

    const query = {
      $and: [],
    };
    // 合约过滤
    if ('instruments' in filter && filter.instruments.length > 0) {
      instruments = filter.instruments;
    }
    // 开始交易日过滤
    if ('startDate' in filter) {
      startDate = filter.startDate;
    }
    // 结束交易日过滤
    if ('endDate' in filter) {
      endDate = filter.endDate;
    }
    // 合约过滤
    query.$and.push({
      instrument: { $in: instruments },
    });
    // 交易日范围过滤
    query.$and.push({
      tradingday: { $gte: startDate, $lte: endDate },
    });

    const sort = { instrument: 1, tradingday: 1 };

    const daybars = await DAYBAR.find(query).sort(sort).toArray();

    return daybars;
  } catch (error) {
    debug('daybar.getList() Error: %o', error);
    throw error;
  }
}

/**
 * get Last Day bar by specified instrument array.
 * @function
 * @param {Array} instruments - instrument array
 * example : ['IF1609']
 * @return {Array} daybars - daybar array.
 * example : [{daybarDoc1}]
 */
export async function getLast(instruments = []) {
  try {
    await getDb();

    const match = { instrument: { $in: instruments } };

    const sort = { tradingday: -1 };
    const group = {
      _id: '$instrument',
      maxtradingday: { $max: '$tradingday' },
      instrument: { $first: '$instrument' },
      tradingday: { $first: '$tradingday' },
      average: { $first: '$average' },
      close: { $first: '$close' },
      high: { $first: '$high' },
      low: { $first: '$low' },
      open: { $first: '$open' },
      openinterest: { $first: '$openinterest' },
      preclose: { $first: '$preclose' },
      preoopeninterest: { $first: '$preoopeninterest' },
      presettlement: { $first: '$presettlement' },
      settlement: { $first: '$settlement' },
      turnover: { $first: '$turnover' },
      volume: { $first: '$volume' },
    };
    const project = {
      _id: 0,
      maxtradingday: 1,
      instrument: 1,
      tradingday: 1,
      average: 1,
      close: 1,
      high: 1,
      low: 1,
      open: 1,
      openinterest: 1,
      preclose: 1,
      preoopeninterest: 1,
      presettlement: 1,
      settlement: 1,
      turnover: 1,
      volume: 1,
    };

    const daybars = await DAYBAR.aggregate([
      { $match: match },
      { $sort: sort },
      { $group: group },
      { $project: project },
    ]).toArray();

    return daybars;
  } catch (error) {
    debug('daybar.getLast() Error: %o', error);
    throw error;
  }
}

/**
 * Obtain one daybar document object by Specified id.
 * @function
 * @param {string} instrumentid - instrument id
 * example : 'IF1609'
 * @param {string} tradingday - ex: options.tradingday
 * example : '20160701'
 * @return {Object} daybar - daybar document content.
 * example : { daybarDoc }
 */
export async function get(instrumentid, tradingday = null) {
  try {
    let daybar;
    if (tradingday === null) {
      daybar = await getLast([instrumentid]);
    } else {
      await getDb();
      const query = { instrument: instrumentid, tradingday: { $lte: tradingday } };
      daybar = await DAYBAR.find(query).sort({ tradingday: -1 }).limit(1).toArray();
    }
    return daybar[0];
  } catch (error) {
    debug('get() Error: %o', error);
    throw error;
  }
}
/**
 * insert  single or multiple daybar documents into daybar collection.
 * @function
 * @param {Array.} daybars - daybar document content.
 * example : { daybarDoc }
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function add(daybars) {
  try {
    await getDb();

    const ret = await DAYBAR.insertMany(daybars);

    return ret.result;
  } catch (error) {
    debug('daybar.add() Error: %o', error);
    throw error;
  }
}
/**
 * update an daybar documents by Specified instrument id and tradingday.
 * @function
 * @param {string} instrumentid - instrument id
 * example : 'ru'
 * @param {string} tradingday - tradingday
 * example : '20160701'
 * @param {Object} keyvalue - The modifications to apply
 * example : { key1: value1, key2: 'value2' })
 * @return {Object} result - return value and count for update.
 * example : { ok: 1, nModified: 1, n: 1 }
 */
export async function set(instrument, tradingday, keyvalue) {
  try {
    await getDb();

    const filter = { instrument, tradingday };
    const update = {
      $set: keyvalue,
      $currentDate: { updatedate: true },
    };
    const options = {
      upsert: true,
    };
    const ret = await DAYBAR.updateOne(
      filter,
      update,
      options,
    );

    return ret.result;
  } catch (error) {
    debug('daybar.set() Error: %o', error);
    throw error;
  }
}
/**
 * remove an daybar documents by Specified instrument and tradingday
 * @function
 * @param {string} instrument - instrument id
 * example : 'ru'
 * @param {string} tradingday - tradingday
 * example : '20160701'
 * @return {Object} result - return value and count for removed.
 * example : { ok: 1, n: 5 }
 */
export async function remove(instrument, tradingday) {
  try {
    await getDb();
    const filter = { instrument, tradingday };
    const ret = await DAYBAR.deleteOne(filter);

    return ret.result;
  } catch (error) {
    debug('daybar.remove() Error: %o', error);
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
    //   // daybar.getList
    //   const filter = {
    //     instrument: ['IF1609', 'IF1608'],
    //     startDate: '20160701',
    //     endDate: '20160707',
    //   };
    //   const daybars = await getList(filter);
    //   debug('daybar.getList:', daybars.map(ins => `${ins.instrument},${ins.tradingday}`));
    // }
    // {
      // // daybar.getLast
      // const daybars = await getLast(['IF1609', 'au1608']);
      // debug('daybar.getLast:', daybars);
    // }
    // {
    //   // get Dominant Last DayBar
    //   import * as instest from './instrument';
    //   const instruments = await instest.getListByRank(1);
    //   const daybars = await getLast(instruments.map(ins => ins.instrumentid));
    //   debug('daybar.getLast:', daybars.map(
    //     daybar => `${daybar.instrument},${daybar.tradingday},${daybar.close}`
    //   ));
    // }
    // {
    //   // daybar.get
    //   let daybar;
    //   daybar = await get('IF1609', '20160701');
    //   debug('daybar.get', daybar);
    //   // daybar.get return last
    //   daybar = await get('IF1609', 0);
    //   debug('daybar.getlast', daybar);
    // }
    // {
    //   // daybar.add
    //   const retadd = await add([
    //     { instrument: 'aaa', tradingday: '20160701', key2: 'tristan' },
    //     { instrument: 'bbb', tradingday: '20160701', key2: 'tristan' },
    //   ]);
    //   debug('daybar.add', retadd);
    // }
    // {
    //   // daybar.set
    //   const retset = await set('aaa', '20160701', { key1: 'aaa1111', key2: 'tristanyou111' });
    //   debug('daybar.set', retset);
    // }
    // {
    //   // daybar.remove
    //   const retremove1 = await remove('aaa', '20160701');
    //   debug('daybar.remove', retremove1);
    //   const retremove2 = await remove('bbb', '20160701');
    //   debug('daybar.remove', retremove2);
    // }
    // //
    // process.exit(0);
  } catch (error) {
    debug('daybar.runTest: %o', error);
  }
}
