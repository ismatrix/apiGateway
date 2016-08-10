require('babel-register');
// const product = require('./product');
// product.runTest();
const crud = require('./sw-mongodb-crud');
crud.product.runTest();
crud.instrument.runTest();
