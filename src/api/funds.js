const debug = require('debug')('api:funds');
import Boom from 'boom';
import * as mongodb from '../mongodb';

export async function getDbFunds(filter, proj) {
  try {
    const smartwin = await mongodb.getdb();
    const users = smartwin.collection('FUND');
    const projection = proj || {};
    const result = await users.find(filter, projection).toArray();
    debug('getDbFunds() find result: %o', result);
    return result;
  } catch (error) {
    debug('getDbFunds() Error: %o', error);
    throw Boom.badImplementation('An internal server error occurred');
  }
}

export async function getFunds() {
  try {
    const filter = {};
    const projection = { _id: 0, fundid: 1, fundname: 1, investmentadviser: 1,
    funddate: 1, equityinitial: 1 };
    const funds = await getDbFunds(filter, projection);

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
    const fund = await getDbFunds({ fundid }, projection);

    if (! fund.length > 0) throw Boom.notFound('Fund not found');

    return { ok: true, fund: fund[0] };
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
