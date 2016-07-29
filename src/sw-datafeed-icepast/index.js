const debug = require('debug')('sw-datafeed-icepast');
import { Ice } from 'ice';
import { MdPast as icePast } from './MdPastSession';
import lowerFirst from 'lodash/lowerFirst';

import stream from 'stream';
const Readable = stream.Readable;

const iceUrl = 'sender:tcp -p 10101 -h invesmart.win';

const resolutionMap = {
  tick: 'T',
  minute: 'M',
  day: 'D',
};

function toLowerFirst(obj) {
  return Object.assign(
    {},
    ...Object.keys(obj).map(key => ({ [lowerFirst(key)]: obj[key] }))
  );
}

const icePastReadable = {
  async init(symbol, resolution, startDate, endDate, options) {
    const id = new Ice.InitializationData();
    id.properties = Ice.createProperties();
    const communicator = Ice.initialize(process.argv, id);
    // Destroy communicator on SIGINT so application exit cleanly.
    process.once('SIGINT', () => {
      if (communicator) {
        debug('destroy communicator');
        communicator.destroy().finally(() => process.exit(0));
      }
    });
    Readable.call(this, options);
    const CallbackReceiverI = new Ice.Class(icePast.MdSessionCallBack, this);
    const proxy = communicator.stringToProxy(iceUrl);
    const server = await icePast.MdSessionPrx.checkedCast(proxy);
    const adapter = await communicator.createObjectAdapter('');
    const r = adapter.addWithUUID(new CallbackReceiverI());
    await proxy.ice_getCachedConnection().setAdapter(adapter);
    debug(resolutionMap[resolution], symbol, startDate, endDate);
    const query = await server.queryData(r.ice_getIdentity(),
      resolutionMap[resolution], symbol, startDate, endDate);
    if (query === '0') this.push(null);
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
    // debug('bar: %o', data);
    this.push(data);
  },
  onBar(tradingDay, symbol, bar) {
    const data = Object.assign(
      {},
      toLowerFirst(bar),
      { symbol, tradingDay, resolution: 'minute' }
    );
    data.timestamp = data.timestamp.toNumber();
    // debug('bar: %o', data);
    this.push(data);
  },
  onDay(tradingDay, symbol, day) {
    const data = Object.assign(
      {},
      toLowerFirst(day),
      { symbol, tradingDay, resolution: 'day' }
    );
    data.timestamp = data.timestamp.toNumber();
    // debug('bar: %o', data);
    this.push(data);
  },
};

export async function subscribe(symbol, resolution, startDate, endDate) {
  try {
    debug('subscribe');
    const myReadable1 = Object.assign(Object.create(Readable.prototype), icePastReadable);
    const options = { objectMode: true };

    myReadable1.init(symbol, resolution, startDate, endDate, options);
    debug('return readable');
    return myReadable1;
  } catch (error) {
    debug('subscribe() Error: %o', error);
  }
}
