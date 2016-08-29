import { Ice } from 'ice';
import createDebug from 'debug';
import { Trade } from './TradeSession';
import { CM } from './Common';

const debug = createDebug('sw-broker-ice');

const onIceCallback = {
  onDone(fundid, done, account, position) {
    debug('fundid: %o', fundid);
    debug('done: %o', done);
    debug('account: %o', account);
    debug('position: %o', position);
  },
  onOrder(fundid, order) {
    debug('fundid: %o', fundid);
    debug('order: %o', order);
  },
};

const CallbackReceiverI = new Ice.Class(Trade.TdSessionCallBack, onIceCallback);


export default function createIceBroker(iceUrl) {
  let setCallbackReturn = -1;
  let communicator;
  let server;

  // Destroy communicator on SIGINT so application exit cleanly.
  process.once('SIGINT', () => {
    if (communicator) {
      debug('destroy communicator');
      communicator.destroy().finally(() => process.exit(0));
    }
  });

  const createSession = async () => {
    try {
      const id = new Ice.InitializationData();
      id.properties = Ice.createProperties();
      communicator = Ice.initialize(process.argv, id);

      const proxy = communicator.stringToProxy(iceUrl);
      server = await Trade.TdSessionPrx.checkedCast(proxy);
      const adapter = await communicator.createObjectAdapter('');
      const r = adapter.addWithUUID(new CallbackReceiverI());
      proxy.ice_getCachedConnection().setAdapter(adapter);
      setCallbackReturn = await server.setCallBack(r.ice_getIdentity());
      debug(`Successfully setCallBack ${setCallbackReturn}`);

      const heartbeat = async () => {
        try {
          debug('heartbeat');
          server.heartBeat();
          await new Promise(resolve => setTimeout(resolve, 2000));
          heartbeat();
        } catch (error) {
          debug('heartbeat() Error %o', error);
          setCallbackReturn = -1;
          createSession();
        }
      };
      heartbeat();
    } catch (error) {
      debug(`Error createSession ${error}`);
    }
  };

  const queryAccount = async () => server.queryAccount();
  const queryPosition = async (fundid) => server.queryPosition(fundid);
  const queryOrder = async (fundid) => server.queryOrder(fundid);
  const queryDone = async (fundid) => server.queryDone(fundid);

  const queryRawAccount = async (from = 0) => server.jsonQueryAccount(from);
  const queryRawPosition = async (fundid, from = 0) => server.jsonQueryPosition(fundid, from);
  const queryRawOrder = async (fundid, from = 0) => server.jsonQueryOrder(fundid, from);
  const queryRawDone = async (fundid, from = 0) => server.jsonQueryDone(fundid, from);

  const order = async ({
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
  }) => server.doOrder(new CM.DoOrder(
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

  const cancelOrder = async (fundid, instrumentid, privateno, orderno) =>
    server.cancleOrder(fundid, instrumentid, privateno, orderno);
  const subscribe = (moduleName, fundid) => {
    debug('subscribe');
    return server.subscribe(moduleName, fundid);
  };
  const unsubscribe = (moduleName, fundid) => {
    debug('unsubscribe');
    return server.unSubscribe(moduleName, fundid);
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

  const iceBroker = Object.create(iceBrokerBase);

  return iceBroker;
}
