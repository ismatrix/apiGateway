const debug = require('debug')('api:auth');
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
    debug(`createUserToken() Error: ${error}`);
  }
}

export async function getTokenByWechatScan(code, state) {
  try {
    const qyUserObj = await qydev.getUser(code);
    debug('getTokenByWechatScan() user: %o', qyUserObj);
    if (qyUserObj.errcode !== 0) {
      const error = { code: 401, message: 'Cannot auth user against Wechat' };
      return { error };
    }
    qyUserObj.userid = qyUserObj.userid;
    const departments = await qydev.getDepartmentById(qyUserObj.department);
    qyUserObj.department = departments.department;
    debug('getTokenByWechatScan() qyUserObj + departments: %o', qyUserObj);
    const dbUserObj = await upsertDbUser(qyUserObj);
    const token = await createUserToken(dbUserObj);
    debug('getTokenByWechatScan() token: %o', token);
    const decoded = jwt.decode(token);
    const data = { token };
    const error = { code: 500, message: 'Cannot create token' };
    const resObj = decoded.userid === qyUserObj.userid ? { data } : { error };
    io.to(`/#${state}`).emit('token', resObj);
    return resObj;
  } catch (error) {
    debug(`getTokenByWechatScan() Error: ${error}`);
  }
}

export async function getTokenByPassword(userid, password) {
  try {
    const dbUserObj = await getDbUserByFilter({ userid });
    const dbHashedPassword = dbUserObj.password;
    if (await argon2.verify(dbHashedPassword, password)) {
      const token = await createUserToken(dbUserObj);
      debug('getTokenByPassword() token: %s', token);
      const data = { token };
      return { data };
    }
    const error = { code: 500, message: 'Cannot authenticate user' };
    return { error };
  } catch (error) {
    debug(`getTokenByPassword() Error: ${error}`);
  }
}
