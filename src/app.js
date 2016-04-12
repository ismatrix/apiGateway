import * as mongodb from './mongodb';
const debug = require('debug')('app.js');

mongodb.connect('mongodb://localhost:27017/test');

async function insertDoc(object) {
  try {
    const db = await mongodb.getdb();
    debug('db object %o', db);
    const collection = await db.collection('test');
    const insertResult = await collection.insertOne(object);
    debug('insertResult %o', insertResult.ops);
  } catch (err) {
    debug('Error insertDoc: %s', err);
  }
}

insertDoc({ firstName: 'Victor' });
