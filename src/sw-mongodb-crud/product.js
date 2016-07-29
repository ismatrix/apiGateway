const debug = require('debug')('sw-mongodb-crud:product');
import * as mongodb from '../mongodb';

let PRODUCT;

(async function getDb() {
  const smartwin = await mongodb.getdb();
  PRODUCT = smartwin.collection('PRODUCT');
}());

export async function getList() {
  try {
    debug('getList()');
  } catch (error) {
    debug('getList() Error: %o', error);
  }
}
