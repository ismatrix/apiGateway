import createDebug from 'debug';
import Boom from 'boom';
import createIceBroker from '../sw-broker-ice';

const debug = createDebug('api:positions');

export async function getPositions(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const iceBroker = createIceBroker(fundid);

    const positions = await iceBroker.queryPositions();

    return { ok: true, positions };
  } catch (error) {
    debug('getPositions() Error: %o', error);
    throw error;
  }
}
