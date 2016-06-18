const debug = require('debug')('auth.js');
import { jwtSecret, wechatConfig } from '../config';
import jsonwebtoken from 'jsonwebtoken';
import * as mongodb from '../mongodb';
import wechat from 'wechat-enterprise';
import request from 'request';
import WXBizMsgCrypt from 'wechat-crypto';
const Promise = require('bluebird');
Promise.promisifyAll(request);

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
    await request(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${wechatConfig.corpId}&corpsecret=${wechatConfig.corpSecret}`,
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          debug(body);
          debug(body.access_token);
          const parsedBody = JSON.parse(body);
          debug(parsedBody.access_token);
          return (body + code);
        }
      });
  } catch (error) {
    debug(`Error wechat auth callback: ${error}`);
  }
}
