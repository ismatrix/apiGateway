import { Ice } from 'ice';
import createDebug from 'debug';
import events from 'events';
import { Trade } from './TradeSession';
import { CM } from './Common';

const debugG = createDebug('sw-broker-ice');
const event = new events.EventEmitter();
const iceBrokers = {};

const onIceCallback = {
  onDone(fundid, done, account, position) {
    debugG('fundid: %o', fundid);
    debugG('done: %o', done);
    debugG('account: %o', account);
    debugG('position: %o', position);
    // Object.assign(order, { fundid });
    this.emit('done', fundid);
  },
  onOrder(fundid, order) {
    debugG('fundid: %o', fundid);
    debugG('order: %o', order);
    Object.assign(order, { fundid });
    this.emit('order', order);
  },
};
const onIceCallbackEvent = Object.assign(Object.create(event), onIceCallback);

const CallbackReceiverI = new Ice.Class(Trade.TdSessionCallBack, onIceCallbackEvent);

export default function createIceBroker(iceUrl, fundID) {
  if (iceUrl in iceBrokers) return iceBrokers[iceUrl];

  const debug = createDebug(`sw-broker-ice:${fundID}`);
  let setCallbackReturn = -1;
  let isCreateSessionPending = false;
  let communicator;
  let server;

  // Destroy communicator on SIGINT so application exit cleanly.
  process.once('SIGINT', () => {
    if (communicator) {
      debug('destroy communicator');
      communicator.destroy().finally(() => process.exit(0));
    }
  });

  function createSessionTimer(time) {
    isCreateSessionPending = true;
    setTimeout(() => {
      isCreateSessionPending = false;
    }, time);
  }

  const destroySession = async () => {
    try {
      debug('destroying communicator');

      const communicatorDestroyPromise = () => new Promise(
        resolve => {
          communicator.destroy().finally(() => resolve());
        }
      );
      if (communicator && communicator.destroy) await communicatorDestroyPromise();

      debug('finished destroySession()');
      return;
    } catch (error) {
      debug('Error destroySession(): %o', error);
    }
  };

  const createSession = async () => {
    try {
      if (setCallbackReturn === 0 || isCreateSessionPending) {
        debug(`skip createSession() because setCallbackReturn === ${setCallbackReturn}\
          OR isCreateSessionPending === ${isCreateSessionPending}`);
        return;
      }
      debug(`run createSession() because setCallbackReturn === ${setCallbackReturn}\
        and isCreateSessionPending === ${isCreateSessionPending}`);
      createSessionTimer(2000);
      await destroySession();

      const id = new Ice.InitializationData();
      id.properties = Ice.createProperties();
      id.properties.setProperty('Ice.Default.InvocationTimeout', '10000');
      id.properties.setProperty('Ice.ACM.Close', '4');
      id.properties.setProperty('Ice.ACM.Heartbeat', '3');
      id.properties.setProperty('Ice.ACM.Timeout', '5');
      communicator = Ice.initialize(process.argv, id);

      const proxy = communicator.stringToProxy(iceUrl);
      server = await Trade.TdSessionPrx.checkedCast(proxy);
      const adapter = await communicator.createObjectAdapter('');
      const r = adapter.addWithUUID(new CallbackReceiverI());
      proxy.ice_getCachedConnection().setAdapter(adapter);

      proxy.ice_getCachedConnection().setCallback({
        closed() {
          debug('closed() server ACM closed the connection after timeout inactivity');
          setCallbackReturn = -1;
        },
        heartbeat() {
          debug('heartbeat() server sent heartbeat');
        },
      });

      [setCallbackReturn] = await Promise.all([
        server.setCallBack(r.ice_getIdentity()),
        server.subscribe('nodejs', fundID),
      ]);
      debug('Successfully setCallBack %o', setCallbackReturn);

      // const acmTimeout = await proxy.getACMTimeout();
      // debug('acmTimeout: %o', acmTimeout);

      event.emit('createSession:success', 'iceClient');
    } catch (error) {
      debug(`createSession() Error: ${error}`);
      event.emit('createSession:error', error);
    }
  };

  function ensureConnection() {
    debug('ensureConnection() setCallbackReturn %o', setCallbackReturn);
    if (setCallbackReturn === 0) return;
    createSession();
    return new Promise((resolve, reject) => {
      event.once('createSession:success', () => {
        debug('connected');
        resolve();
      });
      event.once('createSession:error', error => reject(error));
    });
  }

  const queryAccount = async () => {
    await ensureConnection();
    return await server.queryAccount();
  };
  const queryPosition = async (fundid) => {
    await ensureConnection();
    return await server.queryPosition(fundid);
  };
  const queryOrder = async (fundid) => {
    await ensureConnection();
    return await server.queryOrder(fundid);
  };
  const queryDone = async (fundid) => {
    await ensureConnection();
    return await server.queryDone(fundid);
  };

  const queryRawAccount = async (from = 0) => {
    await ensureConnection();
    return await server.jsonQueryAccount(from);
  };
  const queryRawPosition = async (fundid, from = 0) => {
    await ensureConnection();
    return await server.jsonQueryPosition(fundid, from);
  };
  const queryRawOrder = async (fundid, from = 0) => {
    await ensureConnection();
    return await server.jsonQueryOrder(fundid, from);
  };
  const queryRawDone = async (fundid, from = 0) => {
    await ensureConnection();
    return await server.jsonQueryDone(fundid, from);
  };

  const order = async (orderObj) => {
    const {
      fundid,
      exchangeid,
      brokerid,
      instrumentid,
      ordertype,
      direction,
      offsetflag,
      hedgeflag,
      price,
      volume,
      donetype,
    } = orderObj;
    await ensureConnection();
    debug('order %o', orderObj);
    const result = await server.doOrder(new CM.DoOrder(
      fundid,
      exchangeid,
      brokerid,
      instrumentid,
      ordertype,
      direction,
      offsetflag,
      hedgeflag,
      price,
      volume,
      donetype,
    ));
    debug('doOrder() result %o', result);
    return result;
  };

  const cancelOrder = async (fundid, instrumentid, privateno, orderno) => {
    await ensureConnection();
    debug('cancelOrder %o', orderno);
    const result = await server.cancleOrder(fundid, instrumentid, privateno, orderno);
    debug('cancleOrder() result %o', result);
    return result;
  };

  const subscribe = async (moduleName, fundid) => {
    await ensureConnection();
    return await server.subscribe(moduleName, fundid);
  };
  const unsubscribe = async (moduleName, fundid) => {
    await ensureConnection();
    return await server.unSubscribe(moduleName, fundid);
  };
  const connect = createSession;

  const iceBrokerBase = {
    connect,

    queryAccount,
    queryPosition,
    queryOrder,
    queryDone,

    queryRawAccount,
    queryRawPosition,
    queryRawOrder,
    queryRawDone,

    order,
    cancelOrder,
    subscribe,
    unsubscribe,
  };

  const iceBrokerBaseEvent = Object.assign(Object.create(onIceCallbackEvent), iceBrokerBase);
  const iceBroker = Object.create(iceBrokerBaseEvent);

  iceBrokers[iceUrl] = iceBroker;
  return iceBrokers[iceUrl];
}
