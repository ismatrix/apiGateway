import { Ice, Glacier2 } from 'ice';
import { MD } from './ice/mdsession';
const debug = require('debug')('MDclient.js');

// Initialize the communicator with Ice.Default.Router property
// set to the simple Md MD Glacier2 router.
const id = new Ice.InitializationData();
id.properties = Ice.createProperties();
id.properties.setProperty('Ice.Default.Router', 'MDGlacier2/router:tcp -p 8852 -h fofs.cc');
const communicator = Ice.initialize(process.argv, id);

const onMdServerCallback = Ice.Class(MD.MdCallback, {
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
    const callback = MD.MdCallbackPrx.uncheckedCast(
      adapter.add(new onMdServerCallback(), new Ice.Identity('callback', category))
    );
      // Set the Md session callback.
    session.setCallback(callback);
    session.SubscribeMd('RiskControl', 'T', ['IF1511','MA605']);
  } catch (error) {
    debug('Error %s', error);
  }
}

export async function createSession() {
  try {
    debug('invoke createSession function');
    let router = communicator.getDefaultRouter();
    router = await Glacier2.RouterPrx.checkedCast(router);
    const session = await router.createSession('RiskControl', 'cu16033');
    await runWithSession(router, MD.MdSessionPrx.uncheckedCast(session));
  } catch (error) {
    debug('Error %s', error);
  }
}
