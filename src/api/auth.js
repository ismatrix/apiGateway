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
    const bodyParsed = await request(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${wechatConfig.corpId}&corpsecret=${wechatConfig.corpSecret}`).then((error, response, body) => {
      if (error || response.statusCode !== 200) throw new Error('access_token request failed');
      return JSON.parse(body);
    });
    debug(bodyParsed);
    const user = await request(`https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=${accessToken}&code=${code}`).then((error, response, body) => {
      if (error || response.statusCode !== 200) throw new Error('access_token request failed');
      return JSON.parse(body);
    });
    debug(user);
  } catch (error) {
    debug(`Error wechat auth callback: ${error}`);
  }
}
