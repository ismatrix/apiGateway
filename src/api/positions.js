import createDebug from 'debug';
import Boom from 'boom';
import { position as positionDB } from 'sw-mongodb-crud';

const debug = createDebug('api:positions');

export async function getPositions(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const dbPositions = await positionDB.get(fundid, tradingday);

    if (dbPositions && dbPositions.positions) {
      const positions = dbPositions.positions;
      return { ok: true, tradingday, positions };
    }

    return { ok: true, tradingday, positions: [] };
  } catch (error) {
    debug('getPositions() Error: %o', error);
    throw error;
  }
}
