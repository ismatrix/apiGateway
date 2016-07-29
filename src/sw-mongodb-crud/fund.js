const debug = require('debug')('sw-mongodb-crud:instrument');
import * as mongodb from '../mongodb';

let FUND;

(async function getDb() {
  const smartwin = await mongodb.getdb();
  FUND = smartwin.collection('FUND');
}());

export async function getList() {
  try {
    const filter = {};
    const projection = { _id: 0, fundid: 1, fundname: 1, investmentadviser: 1,
    funddate: 1, equityinitial: 1 };
    const funds = await FUND.find(filter, projection).toArray();
    return funds;
  } catch (error) {
    debug('getList() Error: %o', error);
  }
}
