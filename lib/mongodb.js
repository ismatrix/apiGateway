'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

let connect = exports.connect = (() => {
  var ref = _asyncToGenerator(function* (url) {
    gurl = url;
    try {
      connectionInstance = yield MongoClient.connect(gurl);
      event.emit('connect');
    } catch (err) {
      debug('Mongodb connect Err: %s', err);
      event.emit('error');
    }
  });

  return function connect(_x) {
    return ref.apply(this, arguments);
  };
})();

exports.getdb = getdb;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

// http://mongodb.github.io/node-mongodb-native/2.1/reference/ecmascript6/crud/
// http://mongodb.github.io/node-mongodb-native/2.1/api/index.html
const MongoClient = require('mongodb').MongoClient;
const events = require('events');
const event = new events.EventEmitter();
const debug = require('debug')('mongodb.js');

let connectionInstance;
let gurl;

function getdb() {
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