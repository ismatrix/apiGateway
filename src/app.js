import { Mongodb } from './db.js';

const mongodb = new Mongodb('mongodb://localhost/smartwin');

async function insertDoc(object) {
  try {
    const db = await mongodb.connect();
    const collection = db.collection('test');
    const insertResult = await collection.insertOne(object);
    console.log(insertResult);
  } catch (err) {
    console.log('Mongodb Err: %s', err);
  }
}

// setTimeout(() => {
//   const mdb = db.getConnection();
//   console.log(mdb);
// }, 3000);

// async function insertDoc(object) {
//   try {
//     const collection = mdb.collection('coll1');
//     const insertResult = await collection.insertOne(object);
//     console.log(insertResult);
//   } catch (err) {
//     console.log('Mongodb Err: %s', err);
//   }
// }

insertDoc({ prenom: 'victor' });
