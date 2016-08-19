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
    throw error;
  }
}

export async function get(query = {}) {
  try {
    await getDb();

    const projection = {};

    const user = await USER.findOne(query, projection);
    return user;
  } catch (error) {
    debug('get() Error: %o', error);
    throw error;
  }
}

export async function getList(query = {}) {
  try {
    await getDb();

    const projection = {
      _id: 0, userid: 1, name: 1, department: 1, email: 1, avatar: 1,
    };

    const users = await USER.find(query, projection).toArray();
    return users;
  } catch (error) {
    debug('getList() Error: %o', error);
    throw error;
  }
}

export async function set(filter, setObject) {
  try {
    if (!filter) throw Error('Missing filter parameter');
    if (!setObject) throw Error('Missing setObject parameter');

    await getDb();
    const update = { $set: setObject };
    const ret = await USER.updateOne(filter, update);

    return ret.result;
  } catch (error) {
    debug('set() Error: %o', error);
    throw error;
  }
}

export async function setAndGet(filter, setObject) {
  try {
    if (!filter) throw Error('Missing filter parameter');
    if (!setObject) throw Error('Missing setObject parameter');

    await getDb();
    const options = { upsert: true, returnOriginal: false };
    const update = { $set: setObject };
    const result = await USER.findOneAndUpdate(filter, update, options);

    return result.value;
  } catch (error) {
    debug('setOneAndGet() Error: %o', error);
    throw error;
  }
}

export async function add(users) {
  try {
    if (!users) throw Error('Missing users parameter');

    await getDb();

    const ret = await USER.insertMany(users);

    return ret.result;
  } catch (error) {
    debug('add() Error: %o', error);
    throw error;
  }
}
