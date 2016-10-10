/** @module sw-mongodb-crud/account */
import createDebug from 'debug';

const debug = createDebug('sw-mongodb-crud:tools');
const crud = require('./sw-mongodb-crud');

/**
 * 获取数组某列的合计.
 * @function
 * @param {Array} array
 * @param {string} key
 * @return {Number} sum - 合计.
 */
export async function calcSum(array, key) {
  try {
    const sum = array.reduce((s, c) => s + c[key], 0);
    return sum;
  } catch (error) {
    debug('calcSum() Error:', error);
    return -1;
  }
}

/**
 * 计算持仓单合约的盯市盈亏.
 * @function
 * @param {Object} positionDoc
 * @return {Number} positionProfit - 单条持仓的盯市盈亏.
 */
export async function calcPositionProfit(positionDoc) {
  try {
    let positionProfit = -1;
    const volumemultiple = await crud.instrument.get(positionDoc.instrumentid, 'volumemultiple');
    // 隔夜仓盈亏
    const prePositionProfit =
    (
    positionDoc.direction === 'long' ?
    positionDoc.md.price - positionDoc.md.presettlement :
    positionDoc.md.presettlement - positionDoc.md.price
    )
    * positionDoc.preholdposition * volumemultiple;
    // 今日仓盈亏
    const todayPositionProfit =
    (
    positionDoc.direction === 'long' ?
    positionDoc.md.price - positionDoc.opencost :
    positionDoc.opencost - positionDoc.md.price
    )
    * positionDoc.todayholdposition * volumemultiple;

    positionProfit = prePositionProfit + todayPositionProfit;

    return positionProfit;
  } catch (error) {
    debug('calcPositionProfit() Error:', error);
    return -1;
  }
}
/**
 * 获取整个持仓的盯市盈亏合计.
 * @function
 * @param {Array} positionArray
 * @return {Number} positionsProfit - 整个持仓的盯市盈亏合计.
 */
export async function getPositionsProfit(positionArray) {
  try {
    return calcSum(positionArray, 'positionprofit');
  } catch (error) {
    debug('getPositionsProfit() Error:', error);
    return -1;
  }
}
/**
 * 获取整个持仓的平仓盈亏合计.
 * @function
 * @param {Array} positionArray
 * @return {Number} closeProfit - 整个持仓的平仓盈亏合计.
 */
export async function getCloseProfit(positionArray) {
  try {
    return calcSum(positionArray, 'closeprofit');
  } catch (error) {
    debug('getCloseProfit() Error:', error);
    return -1;
  }
}

/**
 * 获取整个持仓的保证金合计.
 * @function
 * @param {Array} positionArray
 * @return {Number} closeProfit - 整个持仓的保证金合计.
 */
export async function getMargin(positionArray) {
  try {
    const margin = {};
    margin.total = await calcSum(positionArray, 'margin');
    margin.long = await calcSum(positionArray.filter(p => p.direction === 'long'), 'margin');
    margin.short = await calcSum(positionArray.filter(p => p.direction === 'short'), 'margin');
    margin.net = margin.long - margin.short;
    return margin;
  } catch (error) {
    debug('getMargin() Error:', error);
    return -1;
  }
}

/**
 * an test function.
 * @function
 */
export async function runTest() {
  try {
    // {
    //   // tools.calcSum
    //   const array = [{ a: 1, b: 8 }, { a: 1, b: 8 }, { a: 1, b: 8 }, { a: 1, b: 8 }];
    //   const sum = await calcSum(array, 'b');
    //   debug('tools.calcSum:', sum);
    // }
    {
      // tools.getCloseProfit
      const positionarray = await crud.position.getLast('3000380', '20160901');
      debug('tools.getCloseProfit:\n', positionarray.positionslist.position
      .map(v => `${v.direction},${v.closeprofit},${v.positionprofit},${v.margin}`));
      const closesum = await getCloseProfit(positionarray.positionslist.position);
      const positionsum = await getPositionsProfit(positionarray.positionslist.position);
      const marginsum = await getMargin(positionarray.positionslist.position);
      debug('tools.getCloseProfit:', closesum);
      debug('tools.getPositionProfit:', positionsum);
      debug('tools.getMargin:', marginsum);
    }
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
