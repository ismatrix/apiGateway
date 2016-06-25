'use strict';

let asyncValue = (() => {
  var ref = _asyncToGenerator(function* (value) {
    try {
      yield timeout(3000);
      console.log(value);
      return value;
    } catch (erro) {
      console.log('error');
    }
  });

  return function asyncValue(_x) {
    return ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


asyncValue('10');