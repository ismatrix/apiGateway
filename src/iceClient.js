import { Ice, Glacier2 } from 'ice';
import { MD } from './ice/mdsession';
import { TD } from './ice/tdsession';
const debug = require('debug')('MDclient.js');

export function createIceClient(url, iceServerType) {
  let iceServer;
  let self;
  let session;

  if (iceServerType === 'MD') {
    iceServer = MD;
  } else {
    iceServer = TD;
  }

  // Initialize the communicator with Ice.Default.Router property
  // set to the simple Md MD Glacier2 router.
  const glacierRouterUrl = url;
  const id = new Ice.InitializationData();
  id.properties = Ice.createProperties();
  id.properties.setProperty('Ice.Default.Router', glacierRouterUrl);
  const communicator = Ice.initialize(process.argv, id);

  const OnMdServerCallback = Ice.Class(iceServer.MdCallback, {
    notifyToClient(data) {
      debug('notifyToClient %o', data);
    },
    OnTick(data) {
      debug('OnTick %o', data);
    },
  });

  // Destroy communicator on SIGINT so application exit cleanly.
  process.once('SIGINT', () => {
    if (communicator) {
      debug('destroy communicator');
      communicator.destroy().finally(() => process.exit(0));
    }
  });

  async function runWithSession(router, session) {
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
      const callback = iceServer.MdCallbackPrx.uncheckedCast(
        adapter.add(new OnMdServerCallback(), new Ice.Identity('callback', category))
      );
        // Set the Md session callback.
      session.setCallback(callback);
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
      await runWithSession(router, session);
    } catch (error) {
      debug('Error %s', error);
    }
  };
  if (iceServerType === 'MD') {
    debug('Start MD session');
    self = {
      createSession,
      SubscribeMd: () => session.SubscribeMd,
    };
  } else if (iceServerType === 'TD') {
    self = {
      createSession,
      session: undefined,
    };
  }
  return self;
}
