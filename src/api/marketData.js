const debug = require('debug')('api:marketData');
import Boom from 'boom';
import * as mongodb from '../mongodb';

export async function getCandleStick() {
  try {
    Boom.notImplemented('method not implemented');
  } catch (error) {
    debug('getCandleStick() Error: %o', error);
    throw error;
  }
}

export async function getAvg() {
  try {
    Boom.notImplemented('method not implemented');
  } catch (error) {
    debug('getAvg() Error: %o', error);
    throw error;
  }
}

export async function getAllMA() {
  try {
    Boom.notImplemented('method not implemented');
  } catch (error) {
    debug('getAllMA() Error: %o', error);
    throw error;
  }
}
