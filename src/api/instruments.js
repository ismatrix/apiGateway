const debug = require('debug')('api:instruments');
import Boom from 'boom';
import * as mongodb from '../mongodb';

export async function getMain() {
  try {
    Boom.notImplemented('method not implemented');
  } catch (error) {
    debug('getMain() Error: %o', error);
    throw error;
  }
}
