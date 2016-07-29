const debug = require('debug')('api:funds');
import Boom from 'boom';
import * as mongodb from '../mongodb';
import { fund as dbFund } from '../sw-mongodb-crud';

let FUNDS;

(async function getDb() {
  const smartwin = await mongodb.getdb();
  FUNDS = smartwin.collection('FUND');
}());

export async function getFunds() {
  try {
    const funds = await dbFund.getList();

    if (! funds.length > 0) throw Boom.notFound('Funds not found');

    return { ok: true, funds };
  } catch (error) {
    debug('getFunds() Error: %o', error);
    throw Boom.badImplementation('An internal server error occurred');
  }
}

export async function getFundById(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const projection = { _id: 0, fundid: 1, fundname: 1, investmentadviser: 1,
    funddate: 1, equityinitial: 1 };
    const fund = await FUNDS.findOne({ fundid }, projection);

    if (!fund) throw Boom.notFound('Fund not found');

    return { ok: true, fund };
  } catch (error) {
    debug('getFund() Error: %o', error);
    throw error;
  }
}

export async function getAllPositionLevel() {
  try {
    Boom.notImplemented('method not implemented');
  } catch (error) {
    debug('getAllPositionLevel() Error: %o', error);
    throw error;
  }
}

export async function checkreport() {
  try {
    Boom.notImplemented('method not implemented');
  } catch (error) {
    debug('checkreport() Error: %o', error);
    throw error;
  }
}

export async function getRealTimeEquity() {
  try {
    Boom.notImplemented('method not implemented');
  } catch (error) {
    debug('getRealTimeEquity() Error: %o', error);
    throw error;
  }
}

export async function getEquity() {
  try {
    Boom.notImplemented('method not implemented');
  } catch (error) {
    debug('getEquity() Error: %o', error);
    throw error;
  }
}

export async function getPosition() {
  try {
    Boom.notImplemented('method not implemented');
  } catch (error) {
    debug('getPosition() Error: %o', error);
    throw error;
  }
}
