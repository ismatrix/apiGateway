import createDebug from 'debug';
import Boom from 'boom';
import createIceBroker from '../sw-broker-ice';

const simNowBroker = createIceBroker('sender:tcp -p 20001 -h invesmart.win');
const debug = createDebug('api:orders');

export async function getOrders(fundid) {
  try {
    if (!fundid) throw Boom.badRequest('Missing fundid parameter');

    await simNowBroker.connect();
    await simNowBroker.subscribe('victor', fundid);
    const orders = await simNowBroker.queryOrder(fundid);

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

    await simNowBroker.connect();
    await simNowBroker.subscribe('victor', '068074');
    await simNowBroker.order(order);

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

    return { ok: true };
  } catch (error) {
    debug('getOrders() Error: %o', error);
    throw error;
  }
}
