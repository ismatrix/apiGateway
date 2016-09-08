import { Ice } from 'ice';
import createDebug from 'debug';
import events from 'events';
import { Trade } from './TradeSession';
import { CM } from './Common';
import { funds as fundsDB } from '../config';

const iceBrokers = {};

export default function createIceBroker(fundid) {
  if (fundid in iceBrokers) return iceBrokers[fundid];

  const dbFund = fundsDB.find((fund) => fund.fundid === fundid);
  const iceUrl = `sender:tcp -p ${dbFund.service.port} -h ${dbFund.service.ip}`;

  const debug = createDebug(`sw-broker-ice:${fundid}`);
  const event = new events.EventEmitter();
  let setCallbackReturn = -1;
  let isCreateSessionPending = false;
  let communicator;
  let server;

  const onIceCallback = {
    onDone(fundID, done, account, position) {
      debug('fundid: %o', fundID);
      debug('done: %o', done);
      debug('account: %o', account);
      debug('position: %o', position);
      // Object.assign(order, { fundid });
      this.emit('execution', fundID);
    },
    onOrder(fundID, order) {
      debug('fundid: %o', fundID);
      debug('order: %o', order);
      Object.assign(order, { fundid: fundID });
      this.emit('placement', order);
    },
  };
  const onIceCallbackEvent = Object.assign(Object.create(event), onIceCallback);

  const CallbackReceiverI = new Ice.Class(Trade.TdSessionCallBack, onIceCallbackEvent);

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
      throw error;
    }
  };

  const connect = async () => {
    try {
      if (setCallbackReturn === 0 || isCreateSessionPending) {
        debug(`skip connect() because setCallbackReturn === ${setCallbackReturn}\
          OR isCreateSessionPending === ${isCreateSessionPending}`);
        return;
      }
      debug(`run connect() because setCallbackReturn === ${setCallbackReturn}\
        and isCreateSessionPending === ${isCreateSessionPending}`);
      createSessionTimer(2000);
      await destroySession();

      const id = new Ice.InitializationData();
      id.properties = Ice.createProperties();
      id.properties.setProperty('Ice.Default.InvocationTimeout', '15000');
      id.properties.setProperty('Ice.ACM.Close', '4');
      id.properties.setProperty('Ice.ACM.Heartbeat', '3');
      id.properties.setProperty('Ice.ACM.Timeout', '3');
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
          connect();
        },
        heartbeat() {
          debug('heartbeat() server sent heartbeat');
        },
      });

      [setCallbackReturn] = await Promise.all([
        server.setCallBack(r.ice_getIdentity()),
        server.subscribe('apiGateway', fundid),
      ]);
      debug('Successfully setCallBack %o', setCallbackReturn);

      const heartbeat = async () => {
        try {
          const hb = await server.heartBeat();
          debug('heartbeat %o', hb);
          await new Promise(resolve => setTimeout(resolve, 2000));
          heartbeat();
        } catch (error) {
          debug('heartbeat() Error: %o', error);
          setCallbackReturn = -1;
          debug('call createSession() from heartbeat()');
          connect();
        }
      };
      heartbeat();

      event.emit('connect:success', 'iceClient');
    } catch (error) {
      debug(`connect() Error: ${error}`);
      event.emit('connect:error', error);
      setTimeout(() => connect(), 3000);
    }
  };

  function ensureConnection() {
    debug('ensureConnection() setCallbackReturn %o', setCallbackReturn);
    if (setCallbackReturn === 0) return;
    connect();
    return new Promise((resolve, reject) => {
      event.once('connect:success', () => {
        debug('connected');
        resolve();
      });
      event.once('connect:error', error => reject(error));
    });
  }

  const queryAccount = async () => {
    try {
      await ensureConnection();
      const result = await server.queryAccount();
      return result;
    } catch (error) {
      debug('queryAccount() Error: %o', error);
      throw error;
    }
  };

  const queryPosition = async () => {
    try {
      await ensureConnection();
      const result = await server.queryPosition(fundid);
      return result;
    } catch (error) {
      debug('queryPosition() Error: %o', error);
      throw error;
    }
  };

  const queryOrders = async () => {
    try {
      await ensureConnection();
      const result = await server.queryOrder(fundid);
      debug('orders %o', result);
      return result;
    } catch (error) {
      debug('queryOrders() Error: %o', error);
      throw error;
    }
  };

  const queryDone = async () => {
    try {
      await ensureConnection();
      const result = await server.queryDone(fundid);
      return result;
    } catch (error) {
      debug('queryDone() Error: %o', error);
      throw error;
    }
  };

  const queryRawAccount = async (from = 0) => {
    try {
      await ensureConnection();
      const result = await server.jsonQueryAccount(from);
      return result;
    } catch (error) {
      debug('queryRawAccount() Error: %o', error);
      throw error;
    }
  };

  const queryRawPosition = async (from = 0) => {
    try {
      await ensureConnection();
      const result = await server.jsonQueryPosition(fundid, from);
      return result;
    } catch (error) {
      debug('queryRawPosition() Error: %o', error);
      throw error;
    }
  };

  const queryRawOrder = async (from = 0) => {
    try {
      await ensureConnection();
      const result = await server.jsonQueryOrder(fundid, from);
      return result;
    } catch (error) {
      debug('queryRawOrder() Error: %o', error);
      throw error;
    }
  };

  const queryRawDone = async (from = 0) => {
    try {
      await ensureConnection();
      const result = await server.jsonQueryDone(fundid, from);
      return result;
    } catch (error) {
      debug('queryRawDone() Error: %o', error);
      throw error;
    }
  };

  const order = async (orderObj) => {
    try {
      const {
        exchangeid,
        instrumentid,
        direction,
        offsetflag,
        price,
        volume,
        brokerid = '9999',
        ordertype = '1',
        hedgeflag = '0',
        donetype = '0',
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

      if (result < 0) throw new Error(`the ice method invocation returned ${result}`);
      return result;
    } catch (error) {
      debug('order() Error: %o', error);
      throw error;
    }
  };

  const cancelOrder = async (instrumentid, privateno, orderno) => {
    try {
      debug('cancelOrder() orderno: %o', orderno);
      await ensureConnection();

      const result = await server.cancleOrder(fundid, instrumentid, privateno, orderno);
      debug('orders %o', result);

      if (result !== 0) throw new Error(`the ice method invocation returned ${result}`);

      return result;
    } catch (error) {
      debug('cancelOrder() Error: %o', error);
      throw error;
    }
  };

  const updatePassword = async (oldPassword, newPassword) => {
    try {
      await ensureConnection();

      const result = await server.updatePassword(oldPassword, newPassword);
      debug('orders %o', result);

      if (result !== 0) throw new Error(`the ice method invocation returned ${result}`);

      return result;
    } catch (error) {
      debug('updatePassword() Error: %o', error);
      throw error;
    }
  };

  const subscribe = async (moduleName) => {
    try {
      await ensureConnection();

      const result = await server.subscribe(moduleName, fundid);
      debug('orders %o', result);

      if (result < 0) throw new Error(`the ice method invocation returned ${result}`);

      return result;
    } catch (error) {
      debug('subscribe() Error: %o', error);
      throw error;
    }
  };

  const unsubscribe = async (moduleName) => {
    try {
      await ensureConnection();

      const result = await server.unSubscribe(moduleName, fundid);
      debug('orders %o', result);

      if (result < 0) throw new Error(`the ice method invocation returned ${result}`);

      return result;
    } catch (error) {
      debug('unsubscribe() Error: %o', error);
      throw error;
    }
  };

  const iceBrokerBase = {
    connect,

    queryAccount,
    queryPosition,
    queryOrders,
    queryDone,

    queryRawAccount,
    queryRawPosition,
    queryRawOrder,
    queryRawDone,

    order,
    cancelOrder,

    updatePassword,

    subscribe,
    unsubscribe,
  };

  const iceBrokerBaseEvent = Object.assign(Object.create(onIceCallbackEvent), iceBrokerBase);
  const iceBroker = Object.create(iceBrokerBaseEvent);

  connect();
  iceBrokers[iceUrl] = iceBroker;
  return iceBrokers[iceUrl];
}
