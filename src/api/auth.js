const debug = require('debug')('api:auth');
import Boom from 'boom';
import jwt from 'jsonwebtoken';
import * as mongodb from '../mongodb';
import { jwtSecret, wechatConfig } from '../config';
import makeQydev from '../sw-weixin-qydev';
import argon2 from 'argon2';
import { io } from '../app.js';

let USERS;

(async function getDb() {
  const smartwin = await mongodb.getdb();
  USERS = smartwin.collection('USER');
}());

const qydev = makeQydev(wechatConfig);

export async function createUserToken(userObj) {
  try {
    const dpt = userObj.department.map((obj) => obj.name);
    const jwtTokenData = {
      _id: userObj._id,
      userid: userObj.userid,
      dpt,
    };
    const jwtToken = jwt.sign(jwtTokenData, jwtSecret);
    debug(`createUserToken() jwtToken: ${jwtToken}`);
    return jwtToken;
  } catch (error) {
    debug('createUserToken() Error: %o', error);
  }
}

export async function getTokenByWechatScan(code, state) {
  try {
    if (!code || !state) {
      throw Boom.badRequest('Missing parameter');
    }

    const qyUserObj = await qydev.getUserWithDepartments(code);
    debug('getTokenByWechatScan() user: %o', qyUserObj);

    const userid = qyUserObj.userid.toLowerCase();
    qyUserObj.userid = userid;
    qyUserObj.avatar = qyUserObj.avatar.replace('http://', 'https://');

    const update = { $set: qyUserObj };
    const options = { upsert: true, returnOriginal: false };
    const dbUserObj = await USERS.findOneAndUpdate({ userid }, update, options);

    if (!dbUserObj) {
      throw Boom.badImplementation('Cannot add user to database');
    }

    const token = await createUserToken(dbUserObj.value);
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded.userid === userid) {
        io.to(`/#${state}`).emit('token', { ok: true, token });
        return;
      }
    }

    throw Boom.badImplementation('Cannot create token');
  } catch (error) {
    debug('getTokenByWechatScan() Error: %o', error);
    if (error.isBoom) {
      io.to(`/#${state}`).emit('token', { ok: false, error: error.output.payload.message });
    } else {
      io.to(`/#${state}`).emit('token', { ok: false, error: error.message });
    }
    throw error;
  }
}

export async function getTokenByPassword(userid, password) {
  try {
    if (!userid) throw Boom.badRequest('Missing userid parameter');
    if (!password) throw Boom.badRequest('Missing password parameter');

    const dbUserObj = await USERS.findOne({ userid });

    if (!dbUserObj) throw Boom.notFound('User not found');
    if (!dbUserObj.password) throw Boom.notFound('User must set a password first');

    const dbHashedPassword = dbUserObj.password;
    if (await argon2.verify(dbHashedPassword, password)) {
      const token = await createUserToken(dbUserObj);
      return { ok: true, token };
    }
    throw Boom.unauthorized('Invalid password');
  } catch (error) {
    debug('getTokenByPassword() Error: %o', error);
    throw error;
  }
}
