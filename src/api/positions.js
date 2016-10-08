import createDebug from 'debug';
import Boom from 'boom';
import { position as positionDB } from 'sw-mongodb-crud';

const debug = createDebug('api:positions');

export async function getPositions(fundid, tradingDay) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const dbPositions = await positionDB.getLast(fundid, tradingDay);

    if (dbPositions && dbPositions.positionslist && dbPositions.positionslist.position) {
      const positions = dbPositions.positionslist.position;
      const tradingday = dbPositions.tradingday;
      return { ok: true, tradingday, positions };
    }

    return { ok: true, positions: [] };
  } catch (error) {
    debug('getPositions() Error: %o', error);
    throw error;
  }
}
