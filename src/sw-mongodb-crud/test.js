require('babel-register');

const crud = require('./sw-mongodb-crud');
// crud.product.runTest();
// crud.instrument.runTest();
crud.daybar.runTest();
