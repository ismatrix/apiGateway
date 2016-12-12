import createDebug from 'debug';
import Boom from 'boom';
import createGrpcClient from 'sw-grpc-client';
import { order as orderDB } from 'sw-mongodb-crud';
import { getCanOrderFundConfigs } from '../config';

const debug = createDebug('app:api:orders');
const logError = createDebug('app:api:orders:error');
logError.log = console.error.bind(console);

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
    logError('getOrders(): %o', error);
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

    const fundConf = getCanOrderFundConfigs().find(fund => fund.fundid === fundid);
    debug('fundConf %o', fundConf);
    if (!fundConf) throw Boom.notFound(`Fundid ${fundid} cannot place order`);
    const smartwinFund = createGrpcClient(fundConf);

    await smartwinFund.placeOrder(order);

    return { ok: true };
  } catch (error) {
    logError('postOrder(): %o', error);
    if (error.message.includes('ice method invocation')) throw Boom.badRequest(error.message);
    throw error;
  }
}

export async function deleteOrder(orderToCancel) {
  const {
    fundid,
    sessionid,
    orderid,
    instrumentid,
    privateno,
  } = orderToCancel;
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!sessionid) throw Boom.badRequest('Missing sessionid parameter');
    if (!orderid) throw Boom.badRequest('Missing orderid parameter');
    if (!instrumentid) throw Boom.badRequest('Missing instrumentid parameter');
    if (!privateno) throw Boom.badRequest('Missing privateno parameter');
    debug('orderToCancel %o', orderToCancel);

    const fundConf = getCanOrderFundConfigs().find(fund => fund.fundid === fundid);
    debug('fundConf %o', fundConf);
    if (!fundConf) throw Boom.notFound(`Fundid ${fundid} cannot delete order`);
    const smartwinFund = createGrpcClient(fundConf);

    await smartwinFund.cancelOrder(orderToCancel);

    return { ok: true };
  } catch (error) {
    logError('deleteOrder(): %o', error);
    if (error.message.includes('ice method invocation')) throw Boom.badRequest(error.message);
    throw error;
  }
}
