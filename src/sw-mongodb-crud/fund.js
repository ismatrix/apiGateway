/** @module sw-mongodb-crud/fund */
import createDebug from 'debug';
import * as mongodb from '../mongodb';
import * as equity from './equity';

const debug = createDebug('sw-mongodb-crud:fund');

/** The handle of FUND collection */
let FUND;

/**
 * init the handle of FUND collection.
 * @function
 */
async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    FUND = smartwin.collection('FUND');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}
/**
 * get fund list from FUND collection.
 * @function
 * @param {Object} filter - Query filter documents
 * specify the conditions that determine which records to select for return
 * example : { rank: 1, productclass: 8, exchange: 'SHFE', product: 'ru',istrading: 1 }
 * @return {Array} funds - include count and data array.
 * example : [{fundDoc1}, {fundDoc1}]
 */
export async function getList(filter) {
  try {
    await getDb();

    const query = filter;
    const sort = { state: 1, issuedate: 1 };
    const project = {
      _id: 0,
      period: 0,
      buysell: 0,
      fixedcost: 0,
      reward: 0,
      trading: 0,
      service: 0,
    };

    const funds = await FUND.find(query, project).sort(sort).toArray();

    return funds;
  } catch (error) {
    debug('getList() Error:', error);
  }
}
/**
 * get fund online list
 * @function
 * @return {Array} funds - include count and data array.
 * example : [{fundDoc1}, {fundDoc1}]
 */
export async function getOnlineList() {
  try {
    const filter = { state: 'online' };
    const funds = await getList(filter);

    return funds;
  } catch (error) {
    debug('fund.getOnlineList() Error: %o', error);
    throw error;
  }
}

/**
 * Obtain one fund document object by Specified id.
 * @function
 * @param {string} instrumentid - unique id for fund collection
 * example : 'IF1609'
 * @return {Array} funds - fund document content.
 * example : { fundDoc }
 */
export async function get(id) {
  try {
    await getDb();
    const query = { fundid: id };
    const fund = await FUND.findOne(query);

    return fund;
  } catch (error) {
    debug('fund.get() Error: %o', error);
    throw error;
  }
}

/**
 * insert  single or multiple fund documents into fund collection.
 * @function
 * @param {Array.} documents - fund document content.
 * example : { fundDoc }
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function add(documents) {
  try {
    await getDb();

    const ret = await FUND.insertMany(documents);

    return ret.result;
  } catch (error) {
    debug('fund.add() Error: %o', error);
    throw error;
  }
}
/**
 * update an fund documents by Specified fund id.
 * @function
 * @param {string} instrumentid - unique id for fund collection
 * example : 'ru'
 * @param {Object} keyvalue - The modifications to apply
 * example : { key1: value1, key2: 'value2' })
 * @return {Object} result - return value and count for update.
 * example : { ok: 1, nModified: 1, n: 1 }
 */
export async function set(id, keyvalue) {
  try {
    await getDb();

    const filter = { fundid: id };
    const update = {
      $set: keyvalue,
      $currentDate: { updatedate: true },
    };
    const options = {
      upsert: true,
    };
    const ret = await FUND.updateOne(
      filter,
      update,
      options,
    );

    return ret.result;
  } catch (error) {
    debug('fund.set() Error: %o', error);
    throw error;
  }
}
/**
 * remove an fund documents by Specified fund id.
 * @function
 * @param {string} instrumentid - unique id for product collection
 * example : 'ru'
 * @return {Object} result - return value and count for removed.
 * example : { ok: 1, n: 5 }
 */
export async function remove(fundid) {
  try {
    await getDb();
    const filter = { fundid };
    const ret = await FUND.deleteOne(filter);

    return ret.result;
  } catch (error) {
    debug('fund.remove() Error: %o', error);
    throw error;
  }
}

/**
 * 获取指定基金某日净值
 * @function
 * @return {Array} funds - include count and data array.
 * example : [{fundDoc1}, {fundDoc1}]
 */
export async function getNetValue(fundid, tradingay) {
  try {
    const filter = { state: 'online' };
    const funds = await getList(filter);

    return funds;
  } catch (error) {
    debug('fund.getOnlineList() Error: %o', error);
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
    //   // fund.getList
    //   const filter = { state: 'clearout' };
    //   const funds = await getList(filter);
    //   debug('fund.getList:', funds);
    // }
    // {
    //   // fund.getOnlineList
    //   const funds = await getOnlineList();
    //   debug('fund.getOnlineList:',
    //   funds.map(fund => `${fund.fundid},${fund.fundname}`));
    // }
    // {
    //   // fund.get
    //   const fund = await get('3000767');
    //   debug('fund.get', fund.fundname);
    // }
    // {
    //   // fund.add
    //   const retadd = await add([{ fundid: 'aaa', key1: 1, key2: 'fuck' },
    //   { fundid: 'bbb', key1: 1, key2: 'fuck' }]);
    //   debug('fund.add', retadd);
    // }
    // {
    //   // fund.set
    //   const retset = await set('aaa', { fundname: 'aaa1111', key2: 'fuckyou111' });
    //   debug('fund.set', retset);
    // }
    // {
    //   // fund.remove
    //   const retremove1 = await remove('aaa');
    //   debug('fund.remove', retremove1);
    //   const retremove2 = await remove('bbb');
    //   debug('fund.remove', retremove2);
    // }
    // //
    process.exit(0);
  } catch (error) {
    debug('fund.runTest: %o', error);
  }
}
