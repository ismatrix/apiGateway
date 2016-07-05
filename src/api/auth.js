const debug = require('debug')('api:auth');
import Boom from 'boom';
import jwt from 'jsonwebtoken';
import * as mongodb from '../mongodb';
import { jwtSecret, wechatConfig } from '../config';
import makeQydev from '../sw-wechat-qydev';
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
      io.to(`/#${state}`).emit('token', { ok: false, error: 'Missing parameter' });
      throw Boom.badRequest('Missing parameter');
    }

    const qyUserObj = await qydev.getUser(code);
    debug('getTokenByWechatScan() user: %o', qyUserObj);

    if (qyUserObj.errcode !== 0) {
      io.to(`/#${state}`).emit('token', { ok: false, error: 'Invalid user' });
      throw Boom.unauthorized('Invalid user');
    }

    const departments = await qydev.getDepartmentById(qyUserObj.department);
    qyUserObj.department = departments.department;
    debug('getTokenByWechatScan() qyUserObj + departments: %o', qyUserObj);

    const userid = qyUserObj.userid.toLowerCase();
    qyUserObj.userid = userid;
    qyUserObj.avatar = qyUserObj.avatar.replace('http://', 'https://').concat('64');
    const update = { $set: qyUserObj };
    const options = { upsert: true, returnOriginal: false };
    const dbUserObj = await USERS.findOneAndUpdate({ userid }, update, options);

    if (!dbUserObj) {
      io.to(`/#${state}`).emit('token', { ok: false, error: 'Cannot add user to database' });
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

    io.to(`/#${state}`).emit('token', { ok: false, error: 'Cannot create token' });
    throw Boom.badImplementation('Cannot create token');
  } catch (error) {
    debug('getTokenByWechatScan() Error: %o', error);
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
