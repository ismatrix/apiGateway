const debug = require('debug')('sw-datafeed-icelive');
import { Ice, Glacier2 } from 'ice';
import { MdLive as iceLive } from './MdLiveSession';
import lowerFirst from 'lodash/lowerFirst';
const events = require('events');
const event = new events.EventEmitter();

import stream from 'stream';
const Readable = stream.Readable;

const glacierRouterUrl = 'DemoGlacier2/router:tcp -p 4502 -h 120.76.98.94';
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
    const data = Object.assign(
      {},
      toLowerFirst(ticker),
      { symbol, tradingDay, resolution: 'tick' }
    );
    data.timestamp = data.timestamp.toNumber();
    this.push(data);
  },
  onBar(tradingDay, symbol, bar) {
    const data = Object.assign(
      {},
      toLowerFirst(bar),
      { symbol, tradingDay, resolution: 'minute' }
    );
    data.timestamp = data.timestamp.toNumber();
    this.push(data);
  },
  onDay(tradingDay, symbol, day) {
    const data = Object.assign(
      {},
      toLowerFirst(day),
      { symbol, tradingDay, resolution: 'day' }
    );
    data.timestamp = data.timestamp.toNumber();
    this.push(data);
  },
};

const iceLiveReadableCallback = Object.assign(Object.create(Readable.prototype), iceLiveReadable);
const options = { objectMode: true };
iceLiveReadableCallback.init(options);
// Initialize the communicator with Ice.Default.Router property
// set to the simple Md Glacier2 router.
// const id = new Ice.InitializationData();
// id.properties = Ice.createProperties();
// id.properties.setProperty('Ice.Default.Router', glacierRouterUrl);
// const communicator = Ice.initialize(process.argv, id);
//
// const OnMdServerCallback = new Ice.Class(iceLive.MdSessionCallBack, iceLiveReadableCallback);

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
    debug('router %o', router);
    const sessionDestroyPromise = () => new Promise(
      resolve => {
        router.destroySession().finally(() => resolve());
      }
    );
    if (router && router.destroySession) await sessionDestroyPromise();
    debug('destroying communicator');
    debug('communicator %o', communicator);
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
        and isCreateSessionPending === ${isCreateSessionPending}`);
      return;
    }
    debug(`run createSession() because setCallbackReturn === ${setCallbackReturn}\
      and isCreateSessionPending === ${isCreateSessionPending}`);
    createSessionTimer(2000);
    await destroySession();
    const id = new Ice.InitializationData();
    id.properties = Ice.createProperties();
    id.properties.setProperty('Ice.Default.Router', glacierRouterUrl);
    communicator = Ice.initialize(process.argv, id);
    const OnMdServerCallback = new Ice.Class(iceLive.MdSessionCallBack, iceLiveReadableCallback);
    router = communicator.getDefaultRouter();
    // router.ice_invocationTimeout(5000);
    router = await Glacier2.RouterPrx.checkedCast(router);
    debug('router object %o', router);
    session = await router.createSession('user', 'password');
    session = await iceLive.MdSessionPrx.uncheckedCast(session);
    // create the client object adapter.
    const [timeout, category, adapter] = await Promise.all([
      router.getSessionTimeout(),
      router.getCategoryForClient(),
      communicator.createObjectAdapterWithRouter('', router),
    ]);
    debug('Server timeout: %os', timeout.toNumber());

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
        debug('router: %o', router);
        debug('call createSession() from refreshSession()');
        createSession();
      })
      ;
    };
    refreshSession();

    const callback = iceLive.MdSessionCallBackPrx.uncheckedCast(
      adapter.add(new OnMdServerCallback(), new Ice.Identity('callback', category))
    );
      // Set the Md session callback.
    setCallbackReturn = await session.setCallBack(callback);
    debug('Successfully setCallBack. setCallbackReturn: %o', setCallbackReturn);
    event.emit('createSession:success', 'iceClient');
    return;
  } catch (error) {
    debug('Error createSession(): %o', error);
    event.emit('createSession:error', error);
    setTimeout(() => createSession(), 3000);
  }
};
const connect = createSession;

const subscribe = async (symbol, resolution) => {
  try {
    if (setCallbackReturn === 0) {
      debug(`subscribe('${symbol}', '${resolution}') [immediate call]`);
      const subscribeReturn = await session.subscribeMd(symbol, resolutionMap[resolution]);

      if (subscribeReturn === 0) return subscribeReturn;
      throw new Error(`Error subscribe('${symbol}', '${resolution}')\
      [subscribeReturn: ${subscribeReturn}]`);
    }
    // if the iceLive connection doesn't exist, return a promise that will resolve on connection
    return new Promise((resolve, reject) => {
      debug(`subscribe('${symbol}', '${resolution}') [promisified]`);
      event.once('createSession:success', async () => {
        try {
          debug(`subscribe('${symbol}', '${resolution}') [on createSession:success event]`);
          const subscribeReturn = await session.subscribeMd(symbol, resolutionMap[resolution]);

          if (subscribeReturn === 0) resolve(subscribeReturn);
          reject(new Error(`Error subscribe('${symbol}', '${resolution}')\
          [subscribeReturn: ${subscribeReturn}]`));
        } catch (error) {
          debug('Error subscribe(): %o', error);
          reject(new Error(`Error subscribe('${symbol}', '${resolution}')`));
        }
      });
      event.once('createSession:error', () => {
        reject(new Error(`createSession() error, can't subscribe('${symbol}', '${resolution}')`));
      });
    });
  } catch (error) {
    debug('Error subscribe(): %o', error);
    throw new Error(`ice subscribe() error, can't subscribe('${symbol}', '${resolution}')`);
  }
};

const unsubscribe = async (symbol, resolution) => {
  try {
    if (setCallbackReturn === 0) {
      debug(`unsubscribe('${symbol}', '${resolution}') [immediate call]`);
      const unsubscribeReturn = await session.unSubscribeMd(symbol, resolutionMap[resolution]);

      if (unsubscribeReturn === 0) return unsubscribeReturn;
      throw new Error(`Error unsubscribe('${symbol}', '${resolution}')\
      [unsubscribeReturn: ${unsubscribeReturn}]`);
    }
    // if the iceLive connection doesn't exist, return a promise that will resolve on connection
    return new Promise((resolve, reject) => {
      debug(`unsubscribe('${symbol}', '${resolution}') [promisified]`);
      event.once('createSession:success', async () => {
        try {
          debug(`unsubscribe('${symbol}', '${resolution}') [on createSession:success event]`);
          const unsubscribeReturn = await session.unSubscribeMd(symbol, resolutionMap[resolution]);

          if (unsubscribeReturn === 0) resolve(unsubscribeReturn);
          reject(new Error(`Error unsubscribe('${symbol}', '${resolution}')\
          [unsubscribeReturn: ${unsubscribeReturn}]`));
        } catch (error) {
          debug('Error unsubscribe(): %o', error);
          reject(new Error(`Error unsubscribe('${symbol}', '${resolution}')`));
        }
      });
      event.once('createSession:error', () => {
        reject(new Error(`createSession() error, can't unsubscribe('${symbol}', '${resolution}')`));
      });
    });
  } catch (error) {
    debug('Error unsubscribe(): %o', error);
    throw new Error(`ice unsubscribe() error, can't unsubscribe('${symbol}', '${resolution}')`);
  }
};

const feed = () => iceLiveReadableCallback;

const iceLiveDatafeed = {
  connect,
  subscribe,
  unsubscribe,
  feed,
};
export default iceLiveDatafeed;
