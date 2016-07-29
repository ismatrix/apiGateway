// http://mongodb.github.io/node-mongodb-native/2.1/reference/ecmascript6/crud/
// http://mongodb.github.io/node-mongodb-native/2.1/api/index.html
const MongoClient = require('mongodb').MongoClient;
const events = require('events');
const event = new events.EventEmitter();
const debug = require('debug')('sw-mongodb-crud:mongodb');

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
      debug('connected on promise resolution to existing connectionInstance');
      resolve(connectionInstance);
    });
    event.on('error', () => {
      debug('new connection with instance: %o', connectionInstance);
      reject(new Error('Error connection'));
    });
  });
}
