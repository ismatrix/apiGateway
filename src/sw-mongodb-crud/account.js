/** @module sw-mongodb-crud/account */
import createDebug from 'debug';
import * as mongodb from '../mongodb';

const debug = createDebug('sw-mongodb-crud:account');

/** The handle of ACCOUNT collection */
let CTPACCOUNT;
let STACCOUNT;
let ACCOUNT;

/**
 * init the handle of ACCOUNT collection.
 * @function
 */
async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    CTPACCOUNT = smartwin.collection('CTPACCOUNT');
    STACCOUNT = smartwin.collection('STACCOUNT');
    ACCOUNT = smartwin.collection('ACCOUNT');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}
/**
 * get account list from ACCOUNT collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} accounts - account documents array.
 */
export async function getList(filter = {}, project = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { fundid: 1, tradingday: 1 };
    const accounts = await ACCOUNT.find(query, project).sort(sort).toArray();

    return accounts;
  } catch (error) {
    debug('getList() Error:', error);
  }
}
/**
 * get account list from CTPACCOUNT collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} ctpaccounts - ctp account documents array.
 */
export async function getCTPList(filter = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { accountid: 1, tradingday: 1, updatedate: 1 };
    const project = { _id: 0 };
    const ctpaccounts = await CTPACCOUNT.find(query, project).sort(sort).toArray();

    return ctpaccounts;
  } catch (error) {
    debug('getCTPList() Error:', error);
  }
}
/**
 * convert ctpaccounts to account
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} accounts - account documents array.
 */
export async function ctp2Account(filter = {}) {
  try {
    let preAccountId = null;
    let preTradingDay = null;

    let accountDoc = {};
    const accountArray = [];

    const ctpaccounts = await getCTPList(filter);

    for (let i = 0; i < ctpaccounts.length; i++) {
      const accountItem = {};
      if (ctpaccounts[i].accountid === preAccountId
        && ctpaccounts[i].autotradingday === preTradingDay) {
        accountItem.requestid = ctpaccounts[i].requestid;
        accountItem.updatedate = ctpaccounts[i].updatedate;
        accountItem.balance = ctpaccounts[i].balance;
        accountItem.available = ctpaccounts[i].available;
        accountItem.margin = ctpaccounts[i].currmargin;
        accountItem.incap = ctpaccounts[i].deposit;
        accountItem.outcap = ctpaccounts[i].withdraw;
        accountItem.commission = ctpaccounts[i].commission;
        accountItem.closeprofit = ctpaccounts[i].closeprofit;
        accountItem.positionprofit = ctpaccounts[i].positionprofit;

        accountDoc.account.push(accountItem);
        // 如果到达最后一条，收尾
        if (i === ctpaccounts.length - 1) {
          // debug('pre last %o,%o,%o,%o', i, preAccountId, preTradingDay, account.account.length);
          accountArray.push(accountDoc);
        }
      } else {
        if (Object.keys(accountDoc).length) {
          // debug('pre over %o,%o,%o,%o', i, preAccountId, preTradingDay, account.account.length);
          accountArray.push(accountDoc);
        }
        accountDoc = {};
        accountDoc.fundid = ctpaccounts[i].accountid;
        accountDoc.tradingday = ctpaccounts[i].autotradingday;
        accountDoc.prebalance = ctpaccounts[i].prebalance;
        accountDoc.premargin = ctpaccounts[i].premargin;
        accountDoc.account = [];
        accountItem.requestid = ctpaccounts[i].requestid;
        accountItem.updatedate = ctpaccounts[i].updatedate;
        accountItem.balance = ctpaccounts[i].balance;
        accountItem.available = ctpaccounts[i].available;
        accountItem.margin = ctpaccounts[i].currmargin;
        accountItem.incap = ctpaccounts[i].deposit;
        accountItem.outcap = ctpaccounts[i].withdraw;
        accountItem.commission = ctpaccounts[i].commission;
        accountItem.closeprofit = ctpaccounts[i].closeprofit;
        accountItem.positionprofit = ctpaccounts[i].positionprofit;

        accountDoc.account.push(accountItem);
        preAccountId = ctpaccounts[i].accountid;
        preTradingDay = ctpaccounts[i].autotradingday;
      }
    }
    return accountArray;
  } catch (error) {
    debug('ctp2Accpunt() Error:', error);
  }
}
/**
 * get account list from STACCOUNT collection.
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} staccounts - sungard account documents array.
 */
export async function getSTList(filter = {}) {
  try {
    await getDb();

    const query = filter;
    const sort = { cell_id: 1, tradingday: 1, updatedate: 1 };
    const staccounts = await STACCOUNT.find(query).sort(sort).toArray();

    return staccounts;
  } catch (error) {
    debug('getSTList() Error:', error);
  }
}

/**
 * convert staccounts to account
 * @function
 * @param {Object} filter - Query filter documents
 * @return {Array} accounts - account documents array.
 */
export async function st2Account(filter = {}) {
  try {
    let preCellId = null;
    let preTradingDay = null;

    let accountDoc = {};
    const accountArray = [];

    const staccounts = await getSTList(filter);

    for (let i = 0; i < staccounts.length; i++) {
      const accountItem = {};
      if (staccounts[i].cell_id === preCellId
        && staccounts[i].tradingday === preTradingDay) {
        accountItem.requestid = staccounts[i].requestid;
        accountItem.updatedate = staccounts[i].updatedate;
        accountItem.balance = staccounts[i].deposite + staccounts[i].margin;
        accountItem.available = staccounts[i].deposite;
        accountItem.margin = staccounts[i].margin;
        accountItem.incap = staccounts[i].incap;
        accountItem.outcap = staccounts[i].outcap;
        accountItem.commission = 0;
        accountItem.closeprofit = 0;
        accountItem.positionprofit = 0;

        accountDoc.account.push(accountItem);
        // 如果到达最后一条，收尾
        if (i === staccounts.length - 1) {
          // debug('pre last %o,%o,%o,%o', i, preCellId, preTradingDay, account.account.length);
          accountArray.push(accountDoc);
        }
      } else {
        if (Object.keys(accountDoc).length) {
          // debug('pre over %o,%o,%o,%o', i, preCellId, preTradingDay, account.account.length);
          accountArray.push(accountDoc);
        }
        accountDoc = {};
        accountDoc.fundid = staccounts[i].cell_id;
        accountDoc.tradingday = staccounts[i].tradingday;
        accountDoc.prebalance = staccounts[i].dthis_bal;
        accountDoc.premargin = 0;
        accountDoc.account = [];
        accountItem.requestid = staccounts[i].requestid;
        accountItem.updatedate = staccounts[i].updatedate;
        accountItem.balance = staccounts[i].balance;
        accountItem.available = staccounts[i].available;
        accountItem.margin = staccounts[i].currmargin;
        accountItem.incap = staccounts[i].deposit;
        accountItem.outcap = staccounts[i].withdraw;
        accountItem.commission = staccounts[i].commission;
        accountItem.closeprofit = staccounts[i].closeprofit;
        accountItem.positionprofit = staccounts[i].positionprofit;

        accountDoc.account.push(accountItem);
        preCellId = staccounts[i].cell_id;
        preTradingDay = staccounts[i].tradingday;
      }
    }
    return accountArray;
  } catch (error) {
    debug('st2Accpunt() Error:', error);
  }
}

/**
 * Obtain one account document object by Specified id.
 * @function
 * @param {string} fundid - unique id for account collection
 * @param {string} tradingday - unique id for account collection
 * @return {Array} accounts - account document content.
 * example : { fundDoc }
 */
export async function get(fundid, tradingday) {
  try {
    await getDb();
    const query = { fundid, tradingday };
    const account = await ACCOUNT.findOne(query);

    return account;
  } catch (error) {
    debug('account.get() Error: %o', error);
    throw error;
  }
}

/**
 * insert  single or multiple account documents into account collection.
 * @function
 * @param {Array.} documents - account document content.
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function add(documents) {
  try {
    await getDb();

    const ret = await ACCOUNT.insertMany(documents);

    return ret.result;
  } catch (error) {
    debug('account.add() Error: %o', error);
    throw error;
  }
}
/**
 * update an account documents by Specified account id.
 * @function
 * @param {string} fundid - unique id for account collection
 * @param {string} tradingday - unique id for account collection
 * @param {Object} keyvalue - The modifications to apply
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
    const ret = await ACCOUNT.updateOne(
      filter,
      update,
      options,
    );

    return ret.result;
  } catch (error) {
    debug('account.set() Error: %o', error);
    throw error;
  }
}
/**
 * remove an account documents by Specified account id.
 * @function
 * @param {string} fundid - unique id for product collection
 * @param {string} tradingday - unique id for product collection
 * @return {Object} result - return value and count for removed.
 * example : { ok: 1, n: 5 }
 */
export async function remove(fundid, tradingday) {
  try {
    await getDb();
    const filter = { fundid, tradingday };
    const ret = await ACCOUNT.deleteOne(filter);

    return ret.result;
  } catch (error) {
    debug('account.remove() Error: %o', error);
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
    //   // db.CTPACCOUNT.createIndex( { accountid: 1, tradingday: 1 ,updatedate: 1 } )
    //   // account.getCTPList
    //   const ctpaccounts = await getCTPList();
    //   debug('account.getCTPList:', ctpaccounts.length);
    // }
    // {
    //   // account.ctp2Accpunt
    //   // const filter = { state: 'clearout' };
    //   // const accounts = await ctp2Account({ accountid: 'gxwza',
    //   // tradingday: { $gte: '20160829', $lte: '20160830' } });
    //   const accounts = await ctp2Account();
    //   // debug('new accounts %o', accounts);
    //   const retadd = await add(accounts);
    //   debug('account.ctp2Accpunt.add:', retadd);
    // }
    // {
    //   // db.STACCOUNT.createIndex( { cell_id: 1, tradingday: 1 ,updatedate: 1 } )
    //   // account.getSTList
    //   const staccounts = await getSTList();
    //   debug('account.getSTList:', staccounts.length);
    // }
    // {
    //   const accounts = await st2Account();
    //   // debug('new accounts %o', accounts);
    //   const retadd = await add(accounts);
    //   debug('account.st2Account.add:', retadd);
    // }
    // {
    //   // account.getOnlineList
    //   const accounts = await getOnlineList();
    //   debug('account.getOnlineList:',
    //   accounts.map(account => `${account.fundid},${account.fundname}`));
    // }
    // {
    //   // account.get
    //   const account = await get('3000767');
    //   debug('account.get', account.fundname);
    // }
    // {
    //   // account.add
    //   const retadd = await add([{ fundid: 'aaa', key1: 1, key2: 'fuck' },
    //   { fundid: 'bbb', key1: 1, key2: 'fuck' }]);
    //   debug('account.add', retadd);
    // }
    // {
    //   // account.set
    //   const retset = await set('aaa', { fundname: 'aaa1111', key2: 'fuckyou111' });
    //   debug('account.set', retset);
    // }
    // {
    //   // account.remove
    //   const retremove1 = await remove('aaa');
    //   debug('account.remove', retremove1);
    //   const retremove2 = await remove('bbb');
    //   debug('account.remove', retremove2);
    // }
    // //
    process.exit(0);
  } catch (error) {
    debug('account.runTest: %o', error);
  }
}
