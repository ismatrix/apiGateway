const debug = require('debug')('auth.js');
import jsonwebtoken from 'jsonwebtoken';
import * as mongodb from './mongodb';
import { jwtSecret, wechatConfig } from './config';
import makeQydev from './sw-wechat-qydev';

const qydev = makeQydev(wechatConfig);

export async function loginWechatUser(code, state) {
  try {
    const user = await qydev.getUser(code);
    debug('loginWechatUser() user: %o', user);
    const smartwin = await mongodb.getdb();
    const users = smartwin.collection('USER');
    const condition = { name: users.weixinid };
    const upsert = { $set: users };
    const result = await users.updateOne(condition, upsert, { upsert: true });
    debug('loginWechatUser() mongodb user upsert result: %o', user);
    const jwtTokenData = {
      _id: result._id,
      name: result.name,
    };
    const jwtToken = jsonwebtoken.sign(jwtTokenData, jwtSecret);
    return jwtToken;
  } catch (error) {
    debug(`loginWechatUser() Error: ${error}`);
  }
}
