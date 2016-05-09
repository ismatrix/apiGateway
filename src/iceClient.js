import { Ice, Glacier2 } from 'ice';
import { MdLive as MD } from './ice/MdLiveSession';
import TD from './ice/MdLiveSession';
const debug = require('debug')('MDclient.js');

export function createIceClient(url, iceServerType) {
  let iceServer;
  let self;
  let session;

  if (iceServerType === 'MD') {
    debug('iceServer is MD');
    iceServer = MD;
  } else {
    debug('iceServer is TD');
    iceServer = TD;
  }

  // Initialize the communicator with Ice.Default.Router property
  // set to the simple Md MD Glacier2 router.
  const glacierRouterUrl = url;
  const id = new Ice.InitializationData();
  id.properties = Ice.createProperties();
  id.properties.setProperty('Ice.Default.Router', glacierRouterUrl);
  const communicator = Ice.initialize(process.argv, id);

  const OnMdServerCallback = Ice.Class(iceServer.MdSessionCallBack, {
    onTick(tradingDay, instrumentID, ticker) {
      debug('onTick: tradingDay %s, instrumentID %s', tradingDay, instrumentID);
      debug('onTick: tick %o', ticker.Timestamp);
      debug('onTick: tick %o', ticker.high);
    },
    onBar(tradingDay, instrumentID, bar) {
      debug('onBar: tradingDay %s', tradingDay);
      debug('onBar: instrumentID %s', instrumentID);
      debug('onBar: bar %o', bar);
    },
    onDay(tradingDay, instrumentID, day) {
      debug('onDay: tradingDay %s', tradingDay);
      debug('onDay: instrumentID %s', instrumentID);
      debug('onDay: bar %o', day);
    },
  });

  // Destroy communicator on SIGINT so application exit cleanly.
  process.once('SIGINT', () => {
    if (communicator) {
      debug('destroy communicator');
      communicator.destroy().finally(() => process.exit(0));
    }
  });

  async function runWithSession(router) {
    try {
      debug('invoke runWithSession function');
      // Get the session timeout, the router client category and
      // create the client object adapter.
      const [timeout, category, adapter] = await Promise.all([
        router.getSessionTimeout(),
        router.getCategoryForClient(),
        communicator.createObjectAdapterWithRouter('', router),
      ]);

      // heartbeat refreshSession, timeout seconds, delay milliseconds
      const p = new Ice.Promise();
      const refreshSession = () => {
        router.refreshSession().exception(ex => p.fail(ex)).delay(timeout.toNumber() * 500)
        .then(() => { if (!p.completed()) refreshSession(); });
      };
      refreshSession();

        // Create the MdCallback servant and add it to the ObjectAdapter.
      const callback = iceServer.MdSessionCallBackPrx.uncheckedCast(
        adapter.add(new OnMdServerCallback(), new Ice.Identity('callback', category))
      );
        // Set the Md session callback.
      session.setCallBack(callback);
      // session.SubscribeMd('RiskControl', 'T', ['IF1511', 'MA605']);
    } catch (error) {
      debug('Error %s', error);
    }
  }
  const createSession = async () => {
    try {
      debug('invoke createSession function');
      let router = communicator.getDefaultRouter();
      router = await Glacier2.RouterPrx.checkedCast(router);
      session = await router.createSession('RiskControl', 'cu16033');
      session = await iceServer.MdSessionPrx.uncheckedCast(session);
      await runWithSession(router);
    } catch (error) {
      debug('Error %s', error);
    }
  };
  if (iceServerType === 'MD') {
    debug('Start MD session');
    self = {
      createSession,
      subscribeMd: (a, b) => session.subscribeMd(a, b),
    };
  } else if (iceServerType === 'TD') {
    self = {
      createSession,
      session: undefined,
    };
  }
  return self;
}
