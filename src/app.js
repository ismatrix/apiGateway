import * as mongodb from './mongodb';

mongodb.connect('mongodb://localhost:27017/test');

function insertDoc(object) {
  mongodb.getdb(async function(db) {
    try {
      const collection = db.collection('test');
      const insertResult = await collection.insertOne(object);
      console.log(insertResult.ops);
    } catch (err) {
      console.log('get Err: %s', err);
    }
  });
}

insertDoc({ firstName: 'Victor' });
