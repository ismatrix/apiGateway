const debug = require('debug')('auth.js');
import { jwtSecret, wechatConfig } from '../config';
import jsonwebtoken from 'jsonwebtoken';
import * as mongodb from '../mongodb';
import wechat from 'wechat-enterprise';

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
    const code = params.code;
    const state = params.state;
    const api = new wechat.API(wechatConfig.corpId, wechatConfig.corpsecret, 0);
    api.getLatestToken((err, token) => {
      if (err) debug(`wechat get token error: ${err}`);
      debug(`token: ${token}`);
      api.getUserIdByCode(code, (error, result) => {
        if (err) console.log(`wechat getUserIdByCode error: ${error}`);
        debug(`getUserIdByCode return: ${JSON.stringify(result)}`);
        return { code, state };
      });
    });
  } catch (error) {
    debug(`Error mongo find: ${error}`);
  }
}
