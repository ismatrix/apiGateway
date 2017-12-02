import createDebug from 'debug';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

const debug = createDebug('app:api:positions');
const logError = createDebug('app:api:positions:error');
logError.log = console.error.bind(console);

export async function getPositions(fundid, beginDate, endDate) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const positions = await crud.position.getPositionByFunds(
      fundid,
      beginDate,
      endDate,
    );
    debug('dbPositions.length %o', positions.length);

    return { ok: true, positions };
  } catch (error) {
    logError('getPositions(): %o', error);
    throw error;
  }
}

export async function getOneDayPositions(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const dbPositions = await crud.position.get(fundid, tradingday);
    debug('dbPositions.length %o', dbPositions.length);
    if (dbPositions && dbPositions.positions) {
      const positions = dbPositions.positions;
      return { ok: true, tradingday, positions };
    }

    return { ok: true, tradingday, positions: [] };
  } catch (error) {
    logError('getOneDayPositions(): %o', error);
    throw error;
  }
}

export async function getAllFundsMergedPositions(tradingday) {
  try {
    // if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const positions = await crud.position.getAllFundsInstrumentSum(tradingday);

    return { ok: true, positions };
  } catch (error) {
    logError('getAllFundsMergedPositions(): %o', error);
    throw error;
  }
}

export async function getInstrumentPositionsByFund(tradingday, symbol) {
  try {
    // if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!symbol) throw Boom.badRequest('Missing symbol parameter');

    const positionsByFund = await crud.position.getFundsPositionsByInstrument(tradingday, symbol);

    return { ok: true, positionsByFund };
  } catch (error) {
    logError('getInstrumentPositionsByFund(): %o', error);
    throw error;
  }
}
