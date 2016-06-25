'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPosition = exports.getEquity = exports.getRealTimeEquity = exports.checkreport = exports.getAllPositionLevel = exports.getFund = exports.getFunds = undefined;

let getFunds = exports.getFunds = (() => {
  var ref = _asyncToGenerator(function* () {
    try {
      const smartwin = yield mongodb.getdb();
      const fund = smartwin.collection('FUND');
      const projection = { _id: 0, fundid: 1, fundname: 1 };
      return yield fund.find({}, projection).toArray();
    } catch (error) {
      debug('Error mongo find: %s', error);
    }
  });

  return function getFunds() {
    return ref.apply(this, arguments);
  };
})();

let getFund = exports.getFund = (() => {
  var ref = _asyncToGenerator(function* (fundid) {
    try {
      const smartwin = yield mongodb.getdb();
      const fund = smartwin.collection('FUND');
      const projection = { _id: 0 };
      return yield fund.find({ fundid: fundid }, projection).toArray();
    } catch (error) {
      debug('Error mongo find: %s', error);
    }
  });

  return function getFund(_x) {
    return ref.apply(this, arguments);
  };
})();

let getAllPositionLevel = exports.getAllPositionLevel = (() => {
  var ref = _asyncToGenerator(function* () {
    return 'getAllPositionLevel';
  });

  return function getAllPositionLevel() {
    return ref.apply(this, arguments);
  };
})();

let checkreport = exports.checkreport = (() => {
  var ref = _asyncToGenerator(function* () {
    return 'checkreport';
  });

  return function checkreport() {
    return ref.apply(this, arguments);
  };
})();

let getRealTimeEquity = exports.getRealTimeEquity = (() => {
  var ref = _asyncToGenerator(function* () {
    return 'getRealTimeEquity';
  });

  return function getRealTimeEquity() {
    return ref.apply(this, arguments);
  };
})();

let getEquity = exports.getEquity = (() => {
  var ref = _asyncToGenerator(function* () {
    return 'getEquity';
  });

  return function getEquity() {
    return ref.apply(this, arguments);
  };
})();

let getPosition = exports.getPosition = (() => {
  var ref = _asyncToGenerator(function* () {
    return 'getPosition';
  });

  return function getPosition() {
    return ref.apply(this, arguments);
  };
})();

var _mongodb = require('../mongodb');

var mongodb = _interopRequireWildcard(_mongodb);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const debug = require('debug')('funds.js');