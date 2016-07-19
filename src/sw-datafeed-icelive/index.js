const debug = require('debug')('sw-datafeed-icelive');
import { Ice, Glacier2 } from 'ice';
import { MdLive as iceLive } from './MdLiveSession';
import lowerFirst from 'lodash/lowerFirst';
const events = require('events');
const event = new events.EventEmitter();

import stream from 'stream';
const Readable = stream.Readable;

const glacierRouterUrl = 'DemoGlacier2/router:tcp -p 4502 -h invesmart.win';
let session;
let router;
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
const id = new Ice.InitializationData();
id.properties = Ice.createProperties();
id.properties.setProperty('Ice.Default.Router', glacierRouterUrl);
const communicator = Ice.initialize(process.argv, id);

const OnMdServerCallback = new Ice.Class(iceLive.MdSessionCallBack, iceLiveReadableCallback);

// Destroy communicator on SIGINT so application exit cleanly.
process.once('SIGINT', () => {
  if (communicator) {
    debug('destroy communicator');
    communicator.destroy().finally(() => process.exit(0));
  }
});

let setCallbackReturn = -1;
let isCreateSessionPending = false;

function createSessionTimer(time) {
  isCreateSessionPending = true;
  setTimeout(() => {
    isCreateSessionPending = false;
  }, time);
}

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
    router = communicator.getDefaultRouter();
    // router.ice_invocationTimeout(5000);
    router = await Glacier2.RouterPrx.checkedCast(router);
    // session.ice_invocationTimeout(5000);
    // router = router.ice_invocationTimeout(5000);
    // router.invocationTimeout = 5000;
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
    //  router refreshSession, timeout seconds, delay milliseconds
    const p = new Ice.Promise();
    const refreshSession = () => {
      debug('refreshSession');
      router.refreshSession().exception(
        ex => {
          debug('refreshSession FAILED');
          debug('exception: %o', ex);
          setCallbackReturn = -1;
          p.fail(ex);
        })
      .delay(timeout.toNumber() * 20)
      .then(() => { if (!p.completed()) refreshSession(); });
    };
    refreshSession();
    //  heartbeat from ice file, timeout seconds, delay milliseconds
    // const heartbeat = async () => {
    //   try {
    //     debug('heartbeat');
    //     session.heartBeat();
    //     await new Promise(resolve => setTimeout(resolve, timeout.toNumber() * 200));
    //     heartbeat();
    //   } catch (error) {
    //     debug(`heartbeat Error ${error}`);
    //   }
    // };
    // heartbeat();

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
    event.emit('createSession:error', 'iceClient');
  }
};
const connect = createSession;

const subscribe = (symbol, resolution) => {
  if (setCallbackReturn === 0) {
    debug(`subscribe('${symbol}', '${resolution}') [immediate call]`);
    return session.subscribeMd(symbol, resolutionMap[resolution]);
  }
  return new Promise((resolve, reject) => {
    debug(`subscribe('${symbol}', '${resolution}') [promisified]`);
    event.on('createSession:success', async () => {
      try {
        debug(`subscribe('${symbol}', '${resolution}') [on createSession:success event]`);
        const subscribeMdReturn = await session.subscribeMd(symbol, resolutionMap[resolution]);
        debug(`subscribe('${symbol}', '${resolution}') [subscribeMdReturn: ${subscribeMdReturn}]`);
        if (subscribeMdReturn === 0) {
          resolve(subscribeMdReturn);
        } else {
          reject(new Error(`Error subscribe('${symbol}', '${resolution}`));
        }
      } catch (error) {
        reject(new Error(`createSession:error, cannot subscribe('${symbol}', '${resolution}`));
      }
    });
    event.on('createSession:error', () => {
      reject(new Error(`createSession:error, cannot subscribe('${symbol}', '${resolution}`));
    });
  });
};

const unsubscribe = (symbol, resolution) => {
  if (setCallbackReturn === 0) {
    debug(`unsubscribe('${symbol}', '${resolution}') [immediate call]`);
    return session.unSubscribeMd(symbol, resolutionMap[resolution]);
  }
  return new Promise((resolve, reject) => {
    debug(`unsubscribe('${symbol}', '${resolution}') [promisified]`);
    event.on('createSession:success', async () => {
      try {
        debug(`unsubscribe('${symbol}', '${resolution}') [on createSession:success event]`);
        const unsubscribeMdReturn = await session.unSubscribeMd(symbol, resolutionMap[resolution]);
        debug(`unsubscribe('${symbol}', '${resolution}')\
          [unsubscribeMdReturn: ${unsubscribeMdReturn}]`);
        if (unsubscribeMdReturn === 0) {
          resolve(unsubscribeMdReturn);
        } else {
          reject(new Error(`Error unsubscribe('${symbol}', '${resolution}`));
        }
      } catch (error) {
        reject(new Error(`createSession:error, cannot unsubscribe('${symbol}', '${resolution}`));
      }
    });
    event.on('createSession:error', () => {
      reject(new Error(`createSession:error, cannot unsubscribe('${symbol}', '${resolution}`));
    });
  });
};

const feed = () => iceLiveReadableCallback;

const iceLiveDatafeed = {
  connect,
  subscribe,
  unsubscribe,
  feed,
};
export default iceLiveDatafeed;
