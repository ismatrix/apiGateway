import * as mongodb from './mongodb';
const debug = require('debug')('app.js');

mongodb.connect('mongodb://localhost:27017/test');

function insertDoc(object) {
  mongodb.getdb(async (db) => {
    try {
      const collection = db.collection('test');
      const insertResult = await collection.insertOne(object);
      console.log(insertResult.ops);
    } catch (err) {
      debug('get Err: %s', err);
    }
  });
}

insertDoc({ firstName: 'Victor' });
