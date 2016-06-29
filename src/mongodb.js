// http://mongodb.github.io/node-mongodb-native/2.1/reference/ecmascript6/crud/
// http://mongodb.github.io/node-mongodb-native/2.1/api/index.html
const MongoClient = require('mongodb').MongoClient;
const events = require('events');
const event = new events.EventEmitter();
const debug = require('debug')('mongodb');

let connectionInstance;
let gurl;

export async function connect(url) {
  gurl = url;
  try {
    connectionInstance = await MongoClient.connect(gurl);
    event.emit('connect');
  } catch (err) {
    debug('Mongodb connect Err: %s', err);
    event.emit('error');
  }
}

export function getdb() {
  if (connectionInstance) {
    debug('existing connection');
    return connectionInstance;
  }
  return new Promise((resolve, reject) => {
    event.on('connect', () => {
      debug('new connection with instance: %o', connectionInstance);
      resolve(connectionInstance);
    });
    event.on('error', () => {
      debug('new connection with instance: %o', connectionInstance);
      reject(new Error('Error connection'));
    });
  });
}

export async function findOne(collection, filter, proj) {
  try {
    const smartwin = await getdb();
    const col = smartwin.collection(collection);
    const projection = proj || {};
    const result = await col.findOne(filter, projection);
    debug('findOne() result: %o', result);
    return result;
  } catch (error) {
    debug(`findOne() Error: ${error}`);
  }
}

export async function find(collection, filter, proj, sort, limit) {
  try {
    const smartwin = await getdb();
    const col = smartwin.collection(collection);
    const projection = proj || {};
    const order = sort || {};
    const lim = limit || 0;
    const result = await col.find(filter, projection).sort(order).limit(lim).toArray();
    debug('findOne() result: %o', result);
    return result;
  } catch (error) {
    debug(`findOne() Error: ${error}`);
  }
}
