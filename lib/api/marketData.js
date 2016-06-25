'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllMA = exports.getAvg = exports.getCandleStick = undefined;

let getCandleStick = exports.getCandleStick = (() => {
  var ref = _asyncToGenerator(function* () {
    return 'getCandleStick';
  });

  return function getCandleStick() {
    return ref.apply(this, arguments);
  };
})();

let getAvg = exports.getAvg = (() => {
  var ref = _asyncToGenerator(function* () {
    return 'getAvg';
  });

  return function getAvg() {
    return ref.apply(this, arguments);
  };
})();

let getAllMA = exports.getAllMA = (() => {
  var ref = _asyncToGenerator(function* () {
    return 'getAllMA';
  });

  return function getAllMA() {
    return ref.apply(this, arguments);
  };
})();

var _mongodb = require('../mongodb');

var mongodb = _interopRequireWildcard(_mongodb);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const debug = require('debug')('funds.js');