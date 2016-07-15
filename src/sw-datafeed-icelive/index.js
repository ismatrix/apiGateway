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
let setCallbackReturn = -1;
// Destroy communicator on SIGINT so application exit cleanly.
process.once('SIGINT', () => {
  if (communicator) {
    debug('destroy communicator');
    communicator.destroy().finally(() => process.exit(0));
  }
});

const createSession = async () => {
  try {
    if (router && communicator) {
      debug('skip createSession because router and communicator exist:');
      return;
    }
    debug('No existing session, creating new session...');
    debug(`setCallBackReturn: ${setCallbackReturn}`);
    router = communicator.getDefaultRouter();
    router = await Glacier2.RouterPrx.checkedCast(router);
    session = await router.createSession('user', 'password');
    session = await iceLive.MdSessionPrx.uncheckedCast(session);
    // create the client object adapter.
    const [timeout, category, adapter] = await Promise.all([
      router.getSessionTimeout(),
      router.getCategoryForClient(),
      communicator.createObjectAdapterWithRouter('', router),
    ]);

    //  router refreshSession, timeout seconds, delay milliseconds
    const p = new Ice.Promise();
    const refreshSession = () => {
      debug('refreshSession');
      router.refreshSession().exception(
        ex => {
          debug('refreshSession FAILED');
          communicator.destroy();
          debug('routeur after destroy %o', router);
          debug('communicator after destroy %o', communicator);
          setCallbackReturn = -1;
          debug('setCallbackReturn', setCallbackReturn);
          createSession();
          p.fail(ex);
        })
      .delay(timeout.toNumber() * 200)
      .then(() => { if (!p.completed()) refreshSession(); });
    };
    refreshSession();

    const callback = iceLive.MdSessionCallBackPrx.uncheckedCast(
      adapter.add(new OnMdServerCallback(), new Ice.Identity('callback', category))
    );
      // Set the Md session callback.
    setCallbackReturn = await session.setCallBack(callback);
    debug('Successfully setCallBack. setCallbackReturn: %o', setCallbackReturn);
    event.emit('iceLive:connect', 'iceClient');
    return;
  } catch (error) {
    debug(`Error createSession ${error}`);
    event.emit('error', 'iceClient');
  }
};
const connect = createSession;

const subscribe = (symbol, resolution) => {
  debug(`setCallbackReturn: ${setCallbackReturn}`);
  if (setCallbackReturn === 0) {
    debug(`subscribe('${symbol}', '${resolution}')`);
    return session.subscribeMd(symbol, resolutionMap[resolution]);
  }
  return new Promise((resolve, reject) => {
    debug('subscribe() return Promise');
    event.on('iceLive:connect', () => {
      debug(`subscribe('${symbol}', '${resolution}')`);
      resolve(session.subscribeMd(symbol, resolutionMap[resolution]));
    });
    event.on('error', () => {
      reject(new Error(`Ice connection error, cannot subscribe to ${symbol}`));
    });
  });
};

const unsubscribe = (symbol, resolution) => {
  debug(`setCallbackReturn: ${setCallbackReturn}`);
  if (setCallbackReturn === 0) {
    debug(`unsubscribe('${symbol}', '${resolution}')`);
    return session.unSubscribeMd(symbol, resolutionMap[resolution]);
  }
  return new Promise((resolve, reject) => {
    debug('unsubscribe() return Promise');
    event.on('iceLive:connect', () => {
      debug(`unsubscribe('${symbol}', '${resolution}')`);
      resolve(session.unSubscribeMd(symbol, resolutionMap[resolution]));
    });
    event.on('error', () => {
      reject(new Error(`Ice connection error, cannot unsubscribe to ${symbol}`));
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
