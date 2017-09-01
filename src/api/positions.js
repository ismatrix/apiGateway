import Boom from 'boom';
import crud from 'sw-mongodb-crud';
import logger from 'sw-common';

export async function getPositions(fundid, beginDate, endDate) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const positions = await crud.position.getPositionByFunds(
      fundid,
      beginDate,
      endDate,
    );
    logger.info('dbPositions.length %j', positions.length);

    return { ok: true, positions };
  } catch (error) {
    logger.error('getPositions(): %j', error);
    throw error;
  }
}

export async function getOneDayPositions(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const dbPositions = await crud.position.get(fundid, tradingday);
    logger.info('dbPositions.length %j', dbPositions.length);
    if (dbPositions && dbPositions.positions) {
      const positions = dbPositions.positions;
      return { ok: true, tradingday, positions };
    }

    return { ok: true, tradingday, positions: [] };
  } catch (error) {
    logger.error('getOneDayPositions(): %j', error);
    throw error;
  }
}

export async function getAllFundsMergedPositions(tradingday) {
  try {
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const positions = await crud.position.getAllFundsInstrumentSum(tradingday);

    return { ok: true, positions };
  } catch (error) {
    logger.error('getAllFundsMergedPositions(): %j', error);
    throw error;
  }
}

export async function getInstrumentPositionsByFund(tradingday, symbol) {
  try {
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');
    if (!symbol) throw Boom.badRequest('Missing symbol parameter');

    const positionsByFund = await crud.position.getFundsPositionsByInstrument(tradingday, symbol);

    return { ok: true, positionsByFund };
  } catch (error) {
    logger.error('getInstrumentPositionsByFund(): %j', error);
    throw error;
  }
}
