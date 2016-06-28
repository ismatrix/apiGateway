const debug = require('debug')('api:auth');
import Boom from 'boom';
import jwt from 'jsonwebtoken';
import { getDbUserByFilter, upsertDbUser } from './users';
import { jwtSecret, wechatConfig } from '../config';
import makeQydev from '../sw-wechat-qydev';
import argon2 from 'argon2';
import { io } from '../app.js';

const qydev = makeQydev(wechatConfig);

export async function createUserToken(userObj) {
  try {
    const jwtTokenData = {
      _id: userObj._id,
      userid: userObj.userid,
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
    if (!code) throw Boom.badRequest('Missing code query string');
    if (!state) throw Boom.badRequest('Missing state query string');

    const qyUserObj = await qydev.getUser(code);
    debug('getTokenByWechatScan() user: %o', qyUserObj);

    if (qyUserObj.errcode !== 0) {
      io.to(`/#${state}`).emit('token', { ok: true, error: 'Invalid user' });
      throw Boom.unauthorized('Invalid user');
    }

    qyUserObj.userid = qyUserObj.userid.toLowerCase();
    const departments = await qydev.getDepartmentById(qyUserObj.department);
    qyUserObj.department = departments.department;
    debug('getTokenByWechatScan() qyUserObj + departments: %o', qyUserObj);

    const dbUserObj = await upsertDbUser(qyUserObj);

    if (!dbUserObj) {
      io.to(`/#${state}`).emit('token', { ok: true, error: 'Cannot add user to database' });
      throw Boom.badImplementation('Cannot add user to database');
    }

    const token = await createUserToken(dbUserObj);

    io.to(`/#${state}`).emit('token', { ok: true, token });
    return;
  } catch (error) {
    debug('getTokenByWechatScan() Error: %o', error);
    throw error;
  }
}

export async function getTokenByPassword(userid, password) {
  try {
    if (!userid) throw Boom.badRequest('Missing userid parameter');
    if (!password) throw Boom.badRequest('Missing password parameter');

    const dbUserObj = await getDbUserByFilter({ userid });

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
