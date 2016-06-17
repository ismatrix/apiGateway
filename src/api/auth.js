const debug = require('debug')('auth.js');
import { jwtSecret, wechatConfig } from '../config';
import jsonwebtoken from 'jsonwebtoken';
import * as mongodb from '../mongodb';
import wechat from 'wechat-enterprise';
import WXBizMsgCrypt from 'wechat-crypto';
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


export async function handleWechatCallback(params) {
  try {
    debug(`params.echostr: ${params.echostr}, params.msg_signature: ${params.msg_signature}`);
    debug(`cryptor key: ${cryptor.key}`);
    const decrypted = cryptor.decrypt(params.echostr);
    debug(`decrypted: ${decrypted}`);
    return decrypted;
  } catch (error) {
    debug(`Error wechat auth callback: ${error}`);
  }
}
