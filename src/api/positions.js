import createDebug from 'debug';
import Boom from 'boom';
import { position as positionDB } from 'sw-mongodb-crud';

const debug = createDebug('api:positions');

export async function getPositions(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const dbPositions = await positionDB.get(fundid, tradingday);
    debug('dbPositions %o', dbPositions);
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

export async function getAllFundsMergedPositions(tradingday) {
  try {
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const positions = await positionDB.getAllFundsInstrumentSum(tradingday);

    return { ok: true, positions };
  } catch (error) {
    debug('getAllFundsMergedPositions() Error: %o', error);
    throw error;
  }
}

export async function getInstrumentPositionsByFund(tradingday, symbol) {
  try {
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!symbol) throw Boom.badRequest('Missing symbol parameter');

    const positionsByFund = await positionDB.getFundsPositionsByInstrument(tradingday, symbol);

    return { ok: true, positionsByFund };
  } catch (error) {
    debug('getInstrumentPositionsByFund() Error: %o', error);
    throw error;
  }
}
