import logger from 'sw-common';
import Boom from 'boom';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import makeQydev from 'sw-weixin-qydev';
import crud from 'sw-mongodb-crud';
import config from '../config';
import { io } from '../app';

const qydev = makeQydev(config.wechatConfig);

export async function createUserToken(userObj) {
  try {
    if (!userObj.department) {
      throw Boom.badImplementation(
        'Cannot create token because this user does not belong to any department');
    }
    const dpt = userObj.department.map(obj => obj.name);
    const jwtTokenData = {
      _id: userObj._id,
      userid: userObj.userid,
      dpt,
    };
    const jwtToken = jwt.sign(jwtTokenData, config.jwtSecret);
    logger.info(`createUserToken() jwtToken: ${jwtToken}`);
    return jwtToken;
  } catch (error) {
    logger.error('createUserToken(): %j', error);
    throw error;
  }
}

export async function getTokenByWechatScan(code, state) {
  try {
    if (!code || !state) {
      throw Boom.badRequest('Missing parameter');
    }
    logger.info('code %j, state %j', code, state);

    const qyUserObj = await qydev.getUserWithDepartments(code);
    logger.info('getTokenByWechatScan() user: %j', qyUserObj);

    const userid = qyUserObj.userid.toLowerCase();
    qyUserObj.userid = userid;
    qyUserObj.avatar = qyUserObj.avatar.replace('http://', 'https://');

    const set = qyUserObj;
    const filter = { userid };
    const dbUserObj = await crud.user.setAndGet(filter, set);

    if (!dbUserObj) {
      throw Boom.badImplementation('Cannot add user to database');
    }

    const token = await createUserToken(dbUserObj);
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded.userid === userid) {
        io.to(`${state}`).emit('token', { ok: true, token });
        return;
      }
    }

    throw Boom.badImplementation('Cannot create token');
  } catch (error) {
    logger.error('getTokenByWechatScan(): %j', error);
    if (error.isBoom) {
      io.to(`${state}`).emit('token', { ok: false, error: error.output.payload.message });
    } else {
      io.to(`${state}`).emit('token', { ok: false, error: error.message });
    }
    throw error;
  }
}

export async function getTokenByPassword(_userid, password) {
  try {
    if (!_userid) throw Boom.badRequest('Missing userid parameter');
    if (!password) throw Boom.badRequest('Missing password parameter');

    const userid = _userid.toLowerCase();
    const dbUserObj = await crud.user.get({ userid });
    logger.info(dbUserObj);
    if (!dbUserObj) throw Boom.notFound('User not found');
    if (!dbUserObj.password) throw Boom.notFound('User must set a password first');

    const dbHashedPassword = dbUserObj.password;
    if (await argon2.verify(dbHashedPassword, password)) {
      const token = await createUserToken(dbUserObj);
      return { ok: true, token };
    }
    throw Boom.unauthorized('Invalid password');
  } catch (error) {
    logger.error('getTokenByPassword(): %j', error);
    throw error;
  }
}
