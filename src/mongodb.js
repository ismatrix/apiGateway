const MongoClient = require('mongodb').MongoClient;
const events = require('events');
const event = new events.EventEmitter();
const debug = require('debug')('mongodb.js');

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

export function getdb(cb) {
  if (connectionInstance) {
    cb(connectionInstance);
  } else {
    event.on('connect', () => {
      cb(connectionInstance);
    });
  }
}
