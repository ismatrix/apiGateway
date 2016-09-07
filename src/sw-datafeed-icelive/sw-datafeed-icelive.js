import createDebug from 'debug';
import stream from 'stream';
import events from 'events';
import lowerFirst from 'lodash/lowerFirst';
import through from 'through2';
import { Ice, Glacier2 } from 'ice';
import { MdLive } from './MdLiveSession';

const event = new events.EventEmitter();
const debug = createDebug('sw-datafeed-icelive');
const Readable = stream.Readable;

const glacierRouterUrl = 'DemoGlacier2/router:tcp -p 4502 -h 120.76.98.94';
// const glacierRouterUrl = 'DemoGlacier2/router:tcp -p 4502 -h 121.40.36.116';
let communicator;
let router;
let session;
let setCallbackReturn = -1;
let isCreateSessionPending = false;
const resolutionMap = {
  tick: 'T',
  minute: 'M',
  day: 'day',
};

function toLowerFirst(obj) {
  return Object.assign(
    {},
    ...Object.keys(obj).map(key => ({ [lowerFirst(key)]: obj[key] }))
  );
}

const iceLiveReadable = {
  init(options) {
    Readable.call(this, options);
  },
  _read() {
  },
  onTick(tradingDay, symbol, ticker) {
    // debug('ticker %o', ticker);
    const data = Object.assign(
      {},
      toLowerFirst(ticker),
      { symbol, resolution: 'tick' }
    );
    data.timestamp = new Date(data.timestamp.toNumber());
    data.date = ''.concat(
      tradingDay.slice(0, 4), '-',
      tradingDay.slice(4, 6), '-',
      tradingDay.slice(6, 8),
    );
    // debug('data %o', data);
    this.push(data);
  },
  onBar(tradingDay, symbol, bar) {
    // debug('bar %o', bar);
    const data = Object.assign(
      {},
      toLowerFirst(bar),
      { symbol, resolution: 'minute' }
    );
    data.timestamp = new Date(data.timestamp.toNumber());
    data.date = ''.concat(
      tradingDay.slice(0, 4), '-',
      tradingDay.slice(4, 6), '-',
      tradingDay.slice(6, 8),
    );
    // debug('data %o', data);
    this.push(data);
  },
  onDay(tradingDay, symbol, day) {
    const data = Object.assign(
      {},
      toLowerFirst(day),
      { symbol, resolution: 'day' }
    );
    data.timestamp = new Date(data.timestamp.toNumber());
    data.date = ''.concat(
      tradingDay.slice(0, 4), '-',
      tradingDay.slice(4, 6), '-',
      tradingDay.slice(6, 8),
    );
    this.push(data);
  },
};

const iceLiveReadableCallback = Object.assign(Object.create(Readable.prototype), iceLiveReadable);
const options = { objectMode: true };
iceLiveReadableCallback.init(options);

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
    debug('destroying router session');
    const sessionDestroyPromise = () => new Promise(
      resolve => {
        router.destroySession().finally(() => resolve());
      }
    );
    if (router && router.destroySession) await sessionDestroyPromise();
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
    id.properties.setProperty('Ice.Default.InvocationTimeout', '10000');
    id.properties.setProperty('Ice.ACM.Close', '4');
    id.properties.setProperty('Ice.ACM.Heartbeat', '3');
    id.properties.setProperty('Ice.ACM.Timeout', '15');
    id.properties.setProperty('Ice.Default.Router', glacierRouterUrl);
    communicator = Ice.initialize(process.argv, id);
    const OnMdServerCallback = new Ice.Class(MdLive.MdSessionCallBack, iceLiveReadableCallback);
    router = communicator.getDefaultRouter();

    router = await Glacier2.RouterPrx.checkedCast(router);

    session = await router.createSession('user', 'password');
    session = await MdLive.MdSessionPrx.uncheckedCast(session);

    const [acmTimeout, timeout, category, adapter] = await Promise.all([
      router.getACMTimeout(),
      router.getSessionTimeout(),
      router.getCategoryForClient(),
      communicator.createObjectAdapterWithRouter('', router),
    ]);
    debug('acmTimeout: %o', acmTimeout);
    debug('Server timeout: %os', timeout.toNumber());

    const callback = MdLive.MdSessionCallBackPrx.uncheckedCast(
      adapter.add(new OnMdServerCallback(), new Ice.Identity('callback', category))
    );

    // call refreshSession() every x seconds to keep session active
    const refreshSession = () => {
      debug('refreshSession');
      router.refreshSession()
      .delay(timeout.toNumber() * 100)
      .then(() => {
        refreshSession();
      }, async error => {
        debug('Error refreshSession(): %o', error);
        setCallbackReturn = -1;
        debug('call createSession() from refreshSession()');
        connect();
      })
      ;
    };
    refreshSession();

    router.ice_getCachedConnection().setCallback({
      closed() {
        debug('closed() server ACM closed the connection after timeout inactivity');
        setCallbackReturn = -1;
        connect();
      },
      heartbeat() {
        debug('heartbeat() server sent heartbeat');
      },
    });

    const myACM = router.ice_getCachedConnection().getACM();
    debug('myACM %o', myACM);

    // Set the Md session callback.
    setCallbackReturn = await session.setCallBack(callback);
    debug('Successfully setCallBack. setCallbackReturn: %o', setCallbackReturn);
    event.emit('connect:success', 'iceClient');
    return;
  } catch (error) {
    debug('Error connect(): %o', error);
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

const subscribe = async (symbol, resolution) => {
  try {
    debug('subscribe() {symbol: %o, resolution: %o}', symbol, resolution);
    await ensureConnection();
    const subscribeReturn = await session.subscribeMd(symbol, resolutionMap[resolution]);

    if (subscribeReturn === 0) return subscribeReturn;
    throw new Error();
  } catch (error) {
    debug('Error subscribe(): %o', error);
    throw new Error(`ice subscribe() error, can't subscribe('${symbol}', '${resolution}')`);
  }
};

const unsubscribe = async (symbol, resolution) => {
  try {
    debug('unsubscribe() {symbol: %o, resolution: %o}', symbol, resolution);
    await ensureConnection();
    const unsubscribeReturn = await session.unSubscribeMd(symbol, resolutionMap[resolution]);

    if (unsubscribeReturn === 0) return unsubscribeReturn;
    throw new Error();
  } catch (error) {
    debug('Error unsubscribe(): %o', error);
    throw new Error(`ice unsubscribe() error, can't unsubscribe('${symbol}', '${resolution}')`);
  }
};

function filterFeed(symbol, resolution) {
  return through.obj((data, enc, callback) => {
    if (data.symbol === symbol && data.resolution === resolution) {
      callback(null, data);
    } else {
      callback();
    }
  });
}

const getDataFeed = (symbol, resolution) =>
  iceLiveReadableCallback.pipe(filterFeed(symbol, resolution));


const iceLive = {
  connect,
  subscribe,
  unsubscribe,
  getDataFeed,
};
export default iceLive;
