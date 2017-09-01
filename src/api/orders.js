import Boom from 'boom';
import createGrpcClient from 'sw-grpc-client';
import grpc from 'grpc';
import { isNumber, isString } from 'lodash';
import crud from 'sw-mongodb-crud';
import config from '../config';
import logger from 'sw-common';


export async function getOrders(fundid, beginDate, endDate, product, instrumentid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const orders = await crud.order.getSignalByProduct(
      fundid,
      beginDate,
      endDate,
      product,
      instrumentid,
    );

    return { ok: true, orders };
  } catch (error) {
    logger.error('getOrders(): %j', error);
    throw error;
  }
}

export async function getOneDayOrders(fundid, tradingday) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingday) throw Boom.badRequest('Missing tradingday parameter');

    const dbOrders = await crud.order.getLast(fundid, tradingday);

    if (dbOrders && dbOrders.order) {
      const orders = dbOrders.order;
      return { ok: true, orders };
    }

    return { ok: true, orders: [] };
  } catch (error) {
    logger.error('getOneDayOrders(): %j', error);
    if (error.message.includes('ice method invocation')) throw Boom.badRequest(error.message);
    throw error;
  }
}

export async function postOrder(order, token) {
  try {
    if (!order) throw Boom.badRequest('Missing order object');
    if (!isString(order.fundid)) throw Boom.badRequest('Missing fundid parameter');
    if (!isString(order.exchangeid)) throw Boom.badRequest('Missing exchangeid parameter');
    if (!isString(order.instrumentid)) throw Boom.badRequest('Missing instrumentid parameter');
    if (!isString(order.direction)) throw Boom.badRequest('Missing direction parameter');
    if (!isString(order.offsetflag)) throw Boom.badRequest('Missing offsetflag parameter');
    if (!isNumber(order.price)) throw Boom.badRequest('Missing price parameter or is not a number');
    if (!isNumber(order.volume)) throw Boom.badRequest('Missing volume parameter or is not a number');
    if (!isString(order.signalname)) throw Boom.badRequest('Missing signalname parameter');
    if (!isString(order.strategyid)) throw Boom.badRequest('Missing strategyid parameter');
    if (!isString(order.userid)) throw Boom.badRequest('Missing userid parameter');
    logger.info('order %j', order);

    const fundid = order.fundid;

    const fundConf = config.fundConfigs.find(fund => (fund.fundid === fundid));
    logger.info('fundConf %j', fundConf);

    if (!fundConf) throw Boom.notFound(`Fundid ${fundid} cannot place order`);
    const smartwinFund = createGrpcClient(fundConf);

    const meta = new grpc.Metadata();
    meta.add('Authorization', token);
    await smartwinFund.placeOrder(order, meta);

    return { ok: true };
  } catch (error) {
    logger.error('postOrder(): %j', error);
    if (error.message.includes('ice method invocation')) throw Boom.badRequest(error.message);
    throw error;
  }
}

export async function deleteOrder(orderToCancel, token) {
  try {
    if (!isString(orderToCancel.fundid)) throw Boom.badRequest('Missing fundid parameter');
    if (!isString(orderToCancel.sessionid)) throw Boom.badRequest('Missing sessionid parameter');
    if (!isString(orderToCancel.orderid)) throw Boom.badRequest('Missing orderid parameter');
    if (!isString(orderToCancel.instrumentid)) throw Boom.badRequest('Missing instrumentid parameter');
    if (!isString(orderToCancel.privateno)) throw Boom.badRequest('Missing privateno parameter');
    logger.info('orderToCancel %j', orderToCancel);

    const fundid = orderToCancel.fundid;

    const fundConf = config.fundConfigs.find(fund => (fund.fundid === fundid));
    logger.info('fundConf %j', fundConf);

    if (!fundConf) throw Boom.notFound(`Fundid ${fundid} cannot delete order`);
    const smartwinFund = createGrpcClient(fundConf);

    const meta = new grpc.Metadata();
    meta.add('Authorization', token);
    await smartwinFund.cancelOrder(orderToCancel, meta);

    return { ok: true };
  } catch (error) {
    logger.error('deleteOrder(): %j', error);
    if (error.message.includes('ice method invocation')) throw Boom.badRequest(error.message);
    throw error;
  }
}

export async function getConditionalOrders(fundid) {
  try {
    const query = {};

    if (fundid !== undefined) query.fundid = fundid;

    const orders = await crud.conditionorder.getList(query);

    return { ok: true, orders };
  } catch (error) {
    logger.error('getConditionalOrders(): %j', error);
    throw error;
  }
}

export async function postConditionalOrders(orders) {
  try {
    if (!orders) throw Boom.badRequest('Missing orders parameter');

    await crud.conditionorder.add(orders);

    return { ok: true };
  } catch (error) {
    logger.error('postConditionalOrder(): %j', error);
    throw error;
  }
}

export async function deleteConditionalOrder(orderID) {
  try {
    if (!orderID) throw Boom.badRequest('Missing orderID parameter');

    await crud.conditionorder.remove(orderID);

    return { ok: true };
  } catch (error) {
    logger.error('deleteConditionalOrder(): %j', error);
    throw error;
  }
}
