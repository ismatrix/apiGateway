/** @module sw-mongodb-crud/instrument */
import * as mongodb from '../mongodb';

const debug = require('debug')('sw-mongodb-crud:instrument');

/** The handle of INSTRUMENT collection */
let INSTRUMENT;

/**
 * init the handle of INSTRUMENT collection.
 * @function
 */
async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    INSTRUMENT = smartwin.collection('INSTRUMENT');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}
/**
 * get instrument list from INSTRUMENT collection.
 * @function
 * @param {Object} filter - Query filter documents
 * specify the conditions that determine which records to select for return
 * example : { rank: 1, productclass: 8, exchange: 'SHFE', product: 'ru',istrading: 1 }
 * @return {Array} instruments - include count and data array.
 * example : [{instrumentDoc1}, {instrumentDoc1}]
 */
export async function getList(filter) {
  try {
    await getDb();
    const lookup = {
      from: 'PRODUCT',
      localField: 'productid',
      foreignField: 'productid',
      as: 'product',
    };
    const unwind = '$product';
    const match = {
      $and: [],
    };
    if (filter) {
      // 合约主力排名过滤
      if ('rank' in filter) {
        match.$and.push({ rank: { $in: filter.rank } });
      }
      // 普通合约、主连合约、指数合约过滤
      if ('productclass' in filter) {
        match.$and.push({ productclass: { $in: filter.productclass } });
      }
      // 交易所过滤
      if ('exchange' in filter) {
        match.$and.push({ exchangeid: { $in: filter.exchange } });
      }
      // 品种过滤
      if ('product' in filter) {
        match.$and.push({ productid: { $in: filter.product } });
      }
      // 是否正在交易过滤
      if ('istrading' in filter) {
        match.$and.push({ istrading: { $in: filter.istrading } });
      }
    }
    if (!match.$and.length) delete match.$and;
    const projection = {
      _id: 0,
      instrumentid: 1,
      exchangeid: 1,
      instrumentname: {
        $cond:
        [
          { $or: [{ $eq: ['$productclass', '8'] }, { $eq: ['$productclass', '9'] }] },
          '$instrumentname',
           { $concat: ['$product.productname',
               { $substr: ['$expiredate', 2, 4] }] },
        ],
      },
      volumemultiple: 1,
      rank: 1,
      productclass: 1,
      productid: 1,
      istrading: 1,
    };
    const sort = { exchangeid: 1, productclass: -1, instrumentid: 1 };
    const instruments = await INSTRUMENT.aggregate([
      { $lookup: lookup },
      { $unwind: unwind },
      { $match: match },
      { $project: projection },
      { $sort: sort },
    ]).toArray();

    return instruments;
  } catch (error) {
    debug('instrument.getList() Error: %o', error);
    throw error;
  }
}
/**
 * get instrument list by specified ranks.
 * @function
 * @param {number} rank - instruments ranking
 * example : 1 - dominant, 2 - second dominant, 3 - third......
 * @return {Array} instruments - include count and data array.
 * example : [{instrumentDoc1}, {instrumentDoc1}]
 */
export async function getListByRank(rank) {
  try {
    const filter = { rank: [rank] };
    const instruments = await getList(filter);

    return instruments;
  } catch (error) {
    debug('instrument.getListByRank() Error: %o', error);
    throw error;
  }
}

/**
 * get dominant connection instrument list
 * @function
 * @return {Array} instruments - include count and data array.
 * example : [{instrumentDoc1}, {instrumentDoc1}]
 */
export async function getDominantConnectList() {
  try {
    const filter = { productclass: ['8'] };
    const instruments = await getList(filter);

    return instruments;
  } catch (error) {
    debug('instrument.getListByRank() Error: %o', error);
    throw error;
  }
}
/**
 * get product index instrument list
 * @function
 * @return {Array} instruments - include count and data array.
 * example : [{instrumentDoc1}, {instrumentDoc1}]
 */
export async function getProductIndexList() {
  try {
    const filter = { productclass: ['9'] };
    const instruments = await getList(filter);

    return instruments;
  } catch (error) {
    debug('instrument.getProductIndexList() Error: %o', error);
    throw error;
  }
}
/**
 * get instrument list by specified product.
 * @function
 * @param {Array.} productid - product id array
 * example : ['ag', 'ru', 'au']
 * @param {number} istrading - if is trading now
 * example : 0|false - is not trading, 1|others - is trading
 * @return {Array} instruments - include count and data array.
 * example : [{instrumentDoc1}, {instrumentDoc1}]
 */
export async function getListByProduct(products, isTrading = 1) {
  try {
    await getDb();

    const filter = { product: products, istrading: [isTrading] };
    const instruments = await getList(filter);

    return instruments;
  } catch (error) {
    debug('instrument.getListByProduct() Error: %o', error);
    throw error;
  }
}
/**
 * Obtain one instrument document object by Specified id.
 * @function
 * @param {string} instrumentid - unique id for instrument collection
 * example : 'IF1609'
 * @return {Array} instruments - instrument document content.
 * example : { instrumentDoc }
 */
export async function get(id) {
  try {
    await getDb();
    const query = { instrumentid: id };
    const instrument = await INSTRUMENT.findOne(query);

    return instrument;
  } catch (error) {
    debug('instrument.get() Error: %o', error);
    throw error;
  }
}
/**
 * insert  single or multiple instrument documents into instrument collection.
 * @function
 * @param {Array.} documents - instrument document content.
 * example : { instrumentDoc }
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function add(documents) {
  try {
    await getDb();

    const ret = await INSTRUMENT.insertMany(documents);

    return ret.result;
  } catch (error) {
    debug('instrument.add() Error: %o', error);
    throw error;
  }
}
/**
 * update an instrument documents by Specified instrument id.
 * @function
 * @param {string} instrumentid - unique id for instrument collection
 * example : 'ru'
 * @param {Object} keyvalue - The modifications to apply
 * example : { key1: value1, key2: 'value2' })
 * @return {Object} result - return value and count for update.
 * example : { ok: 1, nModified: 1, n: 1 }
 */
export async function set(id, keyvalue) {
  try {
    await getDb();

    const filter = { instrumentid: id };
    const update = {
      $set: keyvalue,
      $currentDate: { updatedate: true },
    };
    const options = {
      upsert: true,
    };
    const ret = await INSTRUMENT.updateOne(
      filter,
      update,
      options,
    );

    return ret.result;
  } catch (error) {
    debug('instrument.set() Error: %o', error);
    throw error;
  }
}
/**
 * remove an instrument documents by Specified instrument id.
 * @function
 * @param {string} instrumentid - unique id for product collection
 * example : 'ru'
 * @return {Object} result - return value and count for removed.
 * example : { ok: 1, n: 5 }
 */
export async function remove(instrumentid) {
  try {
    await getDb();
    const filter = { instrumentid };
    const ret = await INSTRUMENT.deleteOne(filter);

    return ret.result;
  } catch (error) {
    debug('instrument.remove() Error: %o', error);
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
    //   // instrument.getList
    //   const filter = { rank: [1, 2], product: ['ru'] };
    //   const instruments = await getList(filter);
    //   debug('instrument.getList:', instruments);
    // }
    // {
    //   // instrument.getRankList
    //   const instruments = await getListByRank(1);
    //   debug('instrument.getListByRank:',
    //   instruments.map(ins => ins.instrumentid + ins.instrumentname));
    // }
    // {
    //   // instrument.getDominantConnectList
    //   const DominantConnect = await getDominantConnectList();
    //   debug('instrument.getDominantConnectList:',
    //   DominantConnect.map(ins => ins.instrumentid + ins.instrumentname));
    // }
    // {
    //   // instrument.getProductIndexList
    //   const ProductIndex = await getProductIndexList();
    //   debug('instrument.getProductIndexList:',
    //   ProductIndex.map(ins => ins.instrumentid + ins.instrumentname));
    // }
    // {
    //   // instrument.getProductList
    //   const ProductList = await getListByProduct('ru');
    //   debug('instrument.getProductList:',
    //   ProductList.map(ins => ins.instrumentid + ins.instrumentname));
    // }
    // {
    //   // instrument.get
    //   const instrument = await get('IF1609');
    //   debug('instrument.get', instrument);
    // }
    // {
    //   // instrument.add
    //   const retadd = await add([{ instrumentid: 'aaa', key1: 1, key2: 'fuck' },
    //   { instrumentid: 'bbb', key1: 1, key2: 'fuck' }]);
    //   debug('instrument.add', retadd);
    // }
    // {
    //   // instrument.set
    //   const retset = await set('aaa', { key1: 'aaa1111', key2: 'fuckyou111' });
    //   debug('instrument.set', retset);
    // }
    // {
    //   // instrument.remove
    //   const retremove1 = await remove('aaa');
    //   debug('instrument.remove', retremove1);
    //   const retremove2 = await remove('bbb');
    //   debug('instrument.remove', retremove2);
    // }
    //
    // process.exit(0);
  } catch (error) {
    debug('instrument.runTest: %o', error);
  }
}
