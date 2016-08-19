import createDebug from 'debug';
import Boom from 'boom';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { jwtSecret, wechatConfig } from '../config';
import makeQydev from '../sw-weixin-qydev';
import { io } from '../app.js';
import {
  user as dbUser,
} from '../sw-mongodb-crud';

const debug = createDebug('api:auth');

const qydev = makeQydev(wechatConfig);

export async function createUserToken(userObj) {
  try {
    if (!userObj.department) {
      throw Boom.badImplementation(
        'Cannot create token because this user does not belong to any department');
    }
    const dpt = userObj.department.map((obj) => obj.name);
    const jwtTokenData = {
      _id: userObj._i,
      userid: userObj.userid,
      dpt,
    };
    const jwtToken = jwt.sign(jwtTokenData, jwtSecret);
    debug(`createUserToken() jwtToken: ${jwtToken}`);
    return jwtToken;
  } catch (error) {
    debug('createUserToken() Error: %o', error);
    throw error;
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

    const set = qyUserObj;
    const filter = { userid };
    const dbUserObj = await dbUser.setOneAndGet(filter, set);

    if (!dbUserObj) {
      throw Boom.badImplementation('Cannot add user to database');
    }

    const token = await createUserToken(dbUserObj);
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

    const dbUserObj = await dbUser.getOne({ userid });
    debug(dbUserObj);
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
