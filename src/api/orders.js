import createDebug from 'debug';
import Boom from 'boom';
import createIceBroker from '../sw-broker-ice';
import { funds } from '../config';

const debug = createDebug('api:orders');

export async function getOrders(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const fund = funds.find((aFund) => aFund.fundid === fundid);
    const iceUrl = `sender:tcp -p ${fund.service.port} -h ${fund.service.ip}`;
    const iceBroker = createIceBroker(iceUrl, fundid);

    const orders = await iceBroker.queryOrder(fundid);

    debug('orders %o', orders);

    return { ok: true, orders };
  } catch (error) {
    debug('getOrders() Error: %o', error);
    throw error;
  }
}

export async function getOrder(orderno) {
  try {
    if (!orderno) throw Boom.badRequest('Missing orderno parameter');

    const order = 0;

    return { ok: true, order };
  } catch (error) {
    debug('getOrders() Error: %o', error);
    throw error;
  }
}

export async function postOrder(order) {
  try {
    if (!order) throw Boom.badRequest('Missing order parameter');

    const fundid = order.fundid;
    const fund = funds.find((aFund) => aFund.fundid === fundid);
    const iceUrl = `sender:tcp -p ${fund.service.port} -h ${fund.service.ip}`;
    const iceBroker = createIceBroker(iceUrl, fundid);

    await iceBroker.order(order);

    return { ok: true };
  } catch (error) {
    debug('getOrders() Error: %o', error);
    throw error;
  }
}

export async function deleteOrder({
  fundid,
  orderno,
  instrumentid,
  privateno,
}) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!orderno) throw Boom.badRequest('Missing orderno parameter');
    if (!instrumentid) throw Boom.badRequest('Missing instrumentid parameter');
    if (!privateno) throw Boom.badRequest('Missing privateno parameter');

    const fund = funds.find((aFund) => aFund.fundid === fundid);
    const iceUrl = `sender:tcp -p ${fund.service.port} -h ${fund.service.ip}`;
    const iceBroker = createIceBroker(iceUrl, fundid);

    await iceBroker.cancelOrder(fundid, instrumentid, privateno, orderno);

    return { ok: true };
  } catch (error) {
    debug('getOrders() Error: %o', error);
    throw error;
  }
}
