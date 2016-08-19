import createDebug from 'debug';
import { Ice } from 'ice';
import lowerFirst from 'lodash/lowerFirst';
import stream from 'stream';
import { MdPast } from './MdPastSession';

const debug = createDebug('sw-datafeed-icepast');
const Readable = stream.Readable;

const iceUrl = 'sender:tcp -p 10101 -h 120.76.98.94';

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
    const CallbackReceiverI = new Ice.Class(MdPast.MdSessionCallBack, this);
    const proxy = communicator.stringToProxy(iceUrl);
    const server = await MdPast.MdSessionPrx.checkedCast(proxy);
    const adapter = await communicator.createObjectAdapter('');
    const r = adapter.addWithUUID(new CallbackReceiverI());
    await proxy.ice_getCachedConnection().setAdapter(adapter);
    debug('call ice.queryData(%o, %o, %o, %o)',
      resolutionMap[resolution], symbol, startDate, endDate);
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
    data.timestamp = new Date(data.timestamp.toNumber());
    // debug('bar: %o', data);
    this.push(data);
  },
  onBar(tradingDay, symbol, bar) {
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
    // debug('bar: %o', data.symbol);
    this.push(data);
  },
  onDay(tradingDay, symbol, day) {
    const data = Object.assign(
      {},
      toLowerFirst(day),
      { symbol, tradingDay, resolution: 'day' }
    );
    data.timestamp = new Date(data.timestamp.toNumber());
    // debug('bar: %o', data);
    this.push(data);
  },
};

export default async function createDataFeed(symbol, resolution, startD, endD) {
  try {
    const startDate = startD.split('-').join('');
    const endDate = endD.split('-').join('');
    debug('createDataFeed for symbol %o at %o resolution, from %o to %o',
      symbol, resolution, startDate, endDate);
    const icePastStream = Object.assign(Object.create(Readable.prototype), icePastReadable);
    const options = { objectMode: true };

    icePastStream.init(symbol, resolution, startDate, endDate, options);

    return icePastStream;
  } catch (error) {
    debug('createDataFeed() Error: %o', error);
  }
}
