const debug = require('debug')('funds.js');
import * as mongodb from '../mongodb';

export async function getAllFund() {
  try {
    const db = await mongodb.getdb();
    const collection = await db.collection('FUND');
    const projection = { _id: 0, fundid: 1, fundname: 1 };
    return await collection.find({}, projection).toArray();
  } catch (err) {
    debug('Error mongo find: %s', err);
  }
}

export async function getFundById(fundid) {
  try {
    const db = await mongodb.getdb();
    const collection = await db.collection('FUND');
    const projection = { _id: 0 };
    return await collection.find({ fundid }, projection).toArray();
  } catch (err) {
    debug('Error mongo find: %s', err);
  }
}

export async function getAllPositionLevel() { return 'getAllPositionLevel'; }
export async function checkreport() { return 'checkreport'; }
export async function getRealTimeEquity() { return 'getRealTimeEquity'; }
export async function getEquity() { return 'getEquity'; }
export async function getPosition() { return 'getPosition'; }
