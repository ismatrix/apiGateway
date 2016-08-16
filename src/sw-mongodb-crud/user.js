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

export async function getOne(query = {}) {
  try {
    await getDb();

    const projection = {};

    const user = await USER.findOne(query, projection);
    return user;
  } catch (error) {
    debug('getOne() Error: %o', error);
    throw error;
  }
}

export async function getMany(query = {}) {
  try {
    await getDb();

    const projection = {
      _id: 0, userid: 1, name: 1, department: 1, email: 1, avatar: 1,
    };

    const users = await USER.find(query, projection).toArray();
    return users;
  } catch (error) {
    debug('getMany() Error: %o', error);
    throw error;
  }
}

export async function setOne(filter, set) {
  try {
    if (!filter) throw Error('Missing filter parameter');
    if (!set) throw Error('Missing set parameter');

    await getDb();
    const update = { $set: set };
    const ret = await USER.updateOne(filter, update);

    return ret.result;
  } catch (error) {
    debug('setOne() Error: %o', error);
    throw error;
  }
}

export async function setOneAndGet(filter, set) {
  try {
    if (!filter) throw Error('Missing filter parameter');
    if (!set) throw Error('Missing set parameter');

    await getDb();
    const options = { upsert: true, returnOriginal: false };
    const update = { $set: set };
    const result = await USER.findOneAndUpdate(filter, update, options);

    return result.value;
  } catch (error) {
    debug('setOneAndGet() Error: %o', error);
    throw error;
  }
}

export async function addMany(users) {
  try {
    if (!users) throw Error('Missing users parameter');

    await getDb();

    const ret = await USER.insertMany(users);

    return ret.result;
  } catch (error) {
    debug('addMany() Error: %o', error);
    throw error;
  }
}
