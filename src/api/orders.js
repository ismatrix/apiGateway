import createDebug from 'debug';
import Boom from 'boom';
import createIceBroker from '../sw-broker-ice';

const debug = createDebug('api:orders');

export async function getOrders(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    const iceBroker = createIceBroker(fundid);

    const orders = await iceBroker.queryOrders();

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
    if (!order.fundid) throw Boom.badRequest('Missing fundid parameter');
    if (!order.exchangeid) throw Boom.badRequest('Missing exchangeid parameter');
    if (!order.instrumentid) throw Boom.badRequest('Missing instrumentid parameter');
    if (!order.direction) throw Boom.badRequest('Missing direction parameter');
    if (!order.offsetflag) throw Boom.badRequest('Missing offsetflag parameter');
    if (!order.price) throw Boom.badRequest('Missing price parameter');
    if (!order.volume) throw Boom.badRequest('Missing volume parameter');

    const fundid = order.fundid;

    const iceBroker = createIceBroker(fundid);

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

    const iceBroker = createIceBroker(fundid);

    await iceBroker.cancelOrder(instrumentid, privateno, orderno);

    return { ok: true };
  } catch (error) {
    debug('getOrders() Error: %o', error);
    throw error;
  }
}
