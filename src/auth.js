const debug = require('debug')('auth');
import jwt from 'jsonwebtoken';
import * as mongodb from './mongodb';
import { jwtSecret, wechatConfig } from './config';
import makeQydev from './sw-wechat-qydev';
import { io } from './app.js';

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

export async function upsertDbUser(userObj) {
  try {
    const smartwin = await mongodb.getdb();
    const users = smartwin.collection('USER');
    const filter = { mobile: userObj.mobile };
    const update = { $set: userObj };
    const options = { upsert: true, returnNewDocument: true };
    const result = await users.findOneAndUpdate(filter, update, options);
    debug('upsertDbUser() mongodb user upsert result: %o', result);
    return result.value;
  } catch (error) {
    debug(`upsertDbUser() Error: ${error}`);
  }
}

export async function loginWechatUser(code, state) {
  try {
    const qyUserObj = await qydev.getUser(code);
    debug('loginWechatUser() user: %o', qyUserObj);
    if (qyUserObj.errcode !== 0) return qyUserObj;
    const departments = await qydev.getDepartmentById(qyUserObj.department);
    qyUserObj.department = departments;
    debug('loginWechatUser() qyUserObj + departments: %o', qyUserObj);
    const dbUserObj = await upsertDbUser(qyUserObj);
    const token = await createUserToken(dbUserObj);
    debug('loginWechatUser() token: %o', token);
    const data = { token };
    io.to(`/#${state}`).emit('token', { data });
    return qyUserObj;
  } catch (error) {
    debug(`loginWechatUser() Error: ${error}`);
  }
}
