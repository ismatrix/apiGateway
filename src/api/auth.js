const debug = require('debug')('auth.js');
import { jwtSecret, wechatConfig } from '../config';
import jsonwebtoken from 'jsonwebtoken';
import * as mongodb from '../mongodb';
import wechat from 'wechat-enterprise';
import requestCB from 'request';
import WXBizMsgCrypt from 'wechat-crypto';
const Promise = require('bluebird');
const request = Promise.promisify(requestCB);
Promise.promisifyAll(request);
import fetch from 'node-fetch';

const cryptor = new WXBizMsgCrypt(
  wechatConfig.token, wechatConfig.encodingAESKey, wechatConfig.corpId);


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
    const code = ctx.query.code;
    debug('code from callback: %o', code);
    const atRes = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${wechatConfig.corpId}&corpsecret=${wechatConfig.corpSecret}`);
    const atJson = await atRes.json();
    debug('atRes from fetch: %o', atJson);
    const accessToken = atJson.access_token;
    debug('accessToken from fetch: %o', atJson.access_token);
    const userRes = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=${accessToken}&code=${code}`);
    const userObj = await userRes.json();
    debug('userobj: %o', userObj);
  } catch (error) {
    debug(`Error wechat auth callback: ${error}`);
  }
}
