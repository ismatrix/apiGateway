const debug = require('debug')('sw-mongodb-crud:instrument');
import * as mongodb from '../mongodb';

let INSTRUMENT;

(async function getDb() {
  const smartwin = await mongodb.getdb();
  INSTRUMENT = smartwin.collection('INSTRUMENT');
}());

export async function getList() {
  try {
    debug('getList()');
  } catch (error) {
    debug('getList() Error: %o', error);
  }
}
