const debug = require('debug')('auth.js');
import { jwtSecret, wechatConfig } from '../config';
import jsonwebtoken from 'jsonwebtoken';
import * as mongodb from '../mongodb';
import makeQydev from '../sw-wechat-qydev';
import WXBizMsgCrypt from 'wechat-crypto';
import fetch from 'node-fetch';

const cryptor = new WXBizMsgCrypt(
  wechatConfig.token, wechatConfig.encodingAESKey, wechatConfig.corpId);
const qydev = makeQydev(wechatConfig);

export async function createLoginToken() {
  try {
    const smartwin = await mongodb.getdb();
    const users = smartwin.collection('USER');
    const user = await users.findOne({ name: 'victor' });
    const body = {
      token: jsonwebtoken.sign({
        _id: user._id,
        role: user.role,
      }, jwtSecret),
    };
    return body;
  } catch (error) {
    debug(`Error mongo find: ${error}`);
  }
}

export async function handleWechatCallback(ctx) {
  try {
    if (ctx.query.echostr) return cryptor.decrypt(ctx.query.echostr);
    // const code = ctx.query.code;
    // const state = ctx.query.state;
    // const user = await qydev.getUser(code);
    // debug('userobj: %o', user);
  } catch (error) {
    debug(`handleWechatCallback() Error: ${error}`);
  }
}
