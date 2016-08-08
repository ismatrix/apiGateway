/** @module sw-mongodb-crud/product */

const debug = require('debug')('sw-mongodb-crud:product');
import { mongoUrl } from './config';
import * as mongodb from '../mongodb';

/** The handle of PRODUCT collection */
let PRODUCT;

/**
 * init the handle of PRODUCT collection.
 * @function
 */
async function getDb() {
  try {
    mongodb.connect(mongoUrl);
    const smartwin = await mongodb.getdb();
    PRODUCT = smartwin.collection('PRODUCT');
  } catch (error) {
    debug('product.getDb() Error:', error);
  }
}
/**
 * get product list from PRODUCT collection.
 * @function
 * @param {Object} filter - Query filter documents
 * specify the conditions that determine which records to select for return
 * example : { exchangeid: 'SHFE', productid: 'ru' }
 * @return {Object} content - include count and data array.
 * example : { count: 4, data: [{productDoc1}, {productDoc2}, {productDoc3}, {productDoc4}] }
 */
export async function getList(filter) {
  try {
    await getDb();
    const lookup = {
      from: 'INSTRUMENT',
      localField: 'productid',
      foreignField: 'productid',
      as: 'instrument',
    };
    const unwind = '$instrument';
    const match = {
      $and: [{ 'instrument.rank': 1 }],
    };
    if (filter) {
      match.$and.push(filter);
    }
    const project = {
      _id: 0,
      productid: 1,
      productname: 1,
      exchangeid: 1,
      volumemultiple: 1,
      dominantid: '$instrument.instrumentid',
      dominantopeninterest: '$instrument.openinterest',
    };
    const sort = { dominantopeninterest: -1 };
    const products = await PRODUCT.aggregate([
      { $lookup: lookup },
      { $unwind: unwind },
      { $match: match },
      { $project: project },
      { $sort: sort },
    ]).toArray();

    return { count: products.length, data: products };
  } catch (error) {
    debug('product.getList() Error: %o', error);
    throw error;
  }
}
/**
 * Obtain one product object by Specified conditions.
 * @function
 * @param {string} productid - unique id for product collection
 * example : 'ru'
 * @return {Object} content - product document content.
 * example : { productDoc }
 */
export async function getById(id) {
  try {
    await getDb();
    const match = { productid: id };
    const product = await PRODUCT.findOne(match);

    return product;
  } catch (error) {
    debug('product.getById() Error: %o', error);
    throw error;
  }
}
/**
 * insert  single or multiple product documents into product collection.
 * @function
 * @param {Array.} docArray - product document content.
 * example : { productDoc }
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function add(docArray) {
  try {
    await getDb();
    let ret = {};
    debug('docArray: %o', docArray);
    if (docArray && docArray.length > 0) {
      ret = await PRODUCT.insert(docArray);
    } else {
      debug('docArray is not an Array!');
    }

    return ret.result;
  } catch (error) {
    debug('product.add() Error: %o', error);
    throw error;
  }
}
/**
 * update an product documents by Specified product id.
 * @function
 * @param {string} productid - unique id for product collection
 * example : 'ru'
 * @param {Object} keyvalue - The modifications to apply
 * example : { key1: value1, key2: 'value2' })
 * @return {Object} result - return value and count for update.
 * example : { ok: 1, nModified: 1, n: 1 }
 */
export async function set(id, keyvalue) {
  try {
    await getDb();

    const match = { productid: id };
    const ret = await PRODUCT.update(
      match,
      {
        $set: keyvalue,
        $currentDate: { updatedate: true },
      },
      {
        multi: true,
        upsert: true,
      }
    );

    return ret.result;
  } catch (error) {
    debug('product.set() Error: %o', error);
    throw error;
  }
}
/**
 * remove an product documents by Specified product id.
 * @function
 * @param {string} productid - unique id for product collection
 * example : 'ru'
 * @return {Object} result - return value and count for removed.
 * example : { ok: 1, n: 5 }
 */
export async function remove(id) {
  try {
    await getDb();
    const match = { productid: id };
    const ret = await PRODUCT.remove(match);

    return ret.result;
  } catch (error) {
    debug('product.remove() Error: %o', error);
    throw error;
  }
}
/**
 * an test function.
 * @function
 */
export async function runTest() {
  try {
    // // product.getList
    // const filter = { exchangeid: 'SHFE', productid: 'ru' };
    // const products = await getList(filter);
    // debug('product.getList:', products);
    // // product.getById
    // const product = await getById('IF');
    // debug('product.getById', product);
    // // product.remove
    // const retremove = await remove('aaa');
    // debug('product.remove', retremove);
    // // product.set
    // const retset = await set('aaa', { key1: 1, key2: 'fuck' });
    // debug('product.set', retset);
    // product.add
    // const retadd = await add([{ productid: 'aaa', key1: 1, key2: 'fuck' },
    // { productid: 'aaa', key1: 1, key2: 'fuck' }]);
    // debug('product.add', retadd);

    process.exit(0);
  } catch (error) {
    debug('product.runTest: %o', error);
  }
}
