const debug = require('debug')('funds.js');
import * as mongodb from '../mongodb';

export async function getFunds() {
  try {
    const smartwin = await mongodb.getdb();
    const fund = smartwin.collection('FUND');
    const projection = { _id: 0, fundid: 1, fundname: 1 };
    return await fund.find({}, projection).toArray();
  } catch (err) {
    debug('Error mongo find: %s', err);
  }
}

export async function getFund(fundid) {
  try {
    const smartwin = await mongodb.getdb();
    const fund = smartwin.collection('FUND');
    const projection = { _id: 0 };
    return await fund.find({ fundid }, projection).toArray();
  } catch (err) {
    debug('Error mongo find: %s', err);
  }
}

export async function getAllPositionLevel() {
  return 'getAllPositionLevel';
}
export async function checkreport() { return 'checkreport'; }
export async function getRealTimeEquity() { return 'getRealTimeEquity'; }
export async function getEquity() { return 'getEquity'; }
export async function getPosition() { return 'getPosition'; }
