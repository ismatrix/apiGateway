/** @module sw-mongodb-crud/fund */
import createDebug from 'debug';
import * as mongodb from '../mongodb';

const debug = createDebug('sw-mongodb-crud:user');

let USER;

async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    USER = smartwin.collection('USER');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}

export async function getOne(query) {
  try {
    await getDb();

    const projection = {};

    const user = await USER.findOne(query, projection);
    return user;
  } catch (error) {
    debug('getList() Error: %o', error);
  }
}

export async function getMany() {
  try {
    await getDb();

    const projection = {
      _id: 0, userid: 1, name: 1, department: 1, email: 1, avatar: 1,
    };

    const users = await USER.find({}, projection).toArray();
    return users;
  } catch (error) {
    debug('getList() Error: %o', error);
  }
}

export async function setOne(filter, set) {
  try {
    await getDb();
    const update = { $set: set };
    const ret = await USER.updateOne(filter, update);

    return ret.result;
  } catch (error) {
    debug('instrument.add() Error: %o', error);
    throw error;
  }
}

export async function setOneAndGet(filter, set) {
  try {
    await getDb();
    const options = { upsert: true, returnOriginal: false };
    const update = { $set: set };
    const result = await USER.findOneAndUpdate(filter, update, options);

    return result.value;
  } catch (error) {
    debug('instrument.add() Error: %o', error);
    throw error;
  }
}

export async function addMany(documents) {
  try {
    await getDb();

    const ret = await USER.insertMany(documents);

    return ret.result;
  } catch (error) {
    debug('instrument.add() Error: %o', error);
    throw error;
  }
}
