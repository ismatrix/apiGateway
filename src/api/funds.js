const debug = require('debug')('api:funds');
import * as mongodb from '../mongodb';

export async function getFunds() {
  try {
    const smartwin = await mongodb.getdb();
    const fund = smartwin.collection('FUND');
    const projection = { _id: 0, fundid: 1, fundname: 1 };
    return await fund.find({}, projection).toArray();
  } catch (error) {
    debug('Error mongo find: %s', error);
  }
}

export async function getFund(fundid) {
  try {
    const smartwin = await mongodb.getdb();
    const fund = smartwin.collection('FUND');
    const projection = { _id: 0 };
    return await fund.find({ fundid }, projection).toArray();
  } catch (error) {
    debug('Error mongo find: %s', error);
  }
}

export async function getAllPositionLevel() {
  return 'getAllPositionLevel';
}
export async function checkreport() { return 'checkreport'; }
export async function getRealTimeEquity() { return 'getRealTimeEquity'; }
export async function getEquity() { return 'getEquity'; }
export async function getPosition() { return 'getPosition'; }
