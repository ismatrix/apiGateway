import createDebug from 'debug';
import Boom from 'boom';
// import createIceBroker from 'sw-broker-ice';
import createGrpcClient from 'sw-grpc-client';
import { order as orderDB } from 'sw-mongodb-crud';
import { funds as fundsDB } from '../config';

const debug = createDebug('api:orders');

export async function getOrders(fundid, tradingDay) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!tradingDay) throw Boom.badRequest('Missing tradingDay parameter');

    const dbOrders = await orderDB.getLast(fundid, tradingDay);

    if (dbOrders && dbOrders.order) {
      const orders = dbOrders.order;
      return { ok: true, orders };
    }

    return { ok: true, orders: [] };
  } catch (error) {
    debug('getOrders() Error: %o', error);
    if (error.message.includes('ice method invocation')) throw Boom.badRequest(error.message);
    throw error;
  }
}

export async function postOrder(order) {
  try {
    if (!order.fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!order.exchangeid) throw Boom.badRequest('Missing exchangeid parameter');
    if (!order.instrumentid) throw Boom.badRequest('Missing instrumentid parameter');
    if (!order.direction) throw Boom.badRequest('Missing direction parameter');
    if (!order.offsetflag) throw Boom.badRequest('Missing offsetflag parameter');
    if (!order.price) throw Boom.badRequest('Missing price parameter');
    if (!order.volume) throw Boom.badRequest('Missing volume parameter');
    if (!order.signalname) throw Boom.badRequest('Missing signalname parameter');
    if (!order.strategyid) throw Boom.badRequest('Missing strategyid parameter');
    if (!order.userid) throw Boom.badRequest('Missing userid parameter');
    debug('order %o', order);

    const fundid = order.fundid;

    const fundConf = fundsDB.find(fund => fund.fundid === fundid);
    const smartwinFund = createGrpcClient(fundConf);
    // const iceBroker = createIceBroker(fundConf);

    await smartwinFund.placeOrder(order);
    // await iceBroker.order(order);

    return { ok: true };
  } catch (error) {
    debug('postOrder() Error: %o', error);
    if (error.message.includes('ice method invocation')) throw Boom.badRequest(error.message);
    throw error;
  }
}

export async function deleteOrder(orderToCancel) {
  const {
    fundid,
    sessionid,
    orderno,
    instrumentid,
    privateno,
  } = orderToCancel;
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!sessionid) throw Boom.badRequest('Missing sessionid parameter');
    if (!orderno) throw Boom.badRequest('Missing orderid parameter');
    if (!instrumentid) throw Boom.badRequest('Missing instrumentid parameter');
    if (!privateno) throw Boom.badRequest('Missing privateno parameter');
    debug('orderToCancel %o', orderToCancel);

    const fundConf = fundsDB.find(fund => fund.fundid === fundid);
    const smartwinFund = createGrpcClient(fundConf);
    // const iceBroker = createIceBroker(fundConf);

    await smartwinFund.cancelOrder(orderToCancel);
    // await iceBroker.cancelOrder(sessionid, instrumentid, privateno, orderid);

    return { ok: true };
  } catch (error) {
    debug('deleteOrder() Error: %o', error);
    if (error.message.includes('ice method invocation')) throw Boom.badRequest(error.message);
    throw error;
  }
}
