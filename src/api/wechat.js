const debug = require('debug')('api:wechat');
import { wechatConfig as wxConf } from '../config';
import WXBizMsgCrypt from 'wechat-crypto';
import { loginWechatUser } from '../auth';

const cryptor = new WXBizMsgCrypt(wxConf.token, wxConf.encodingAESKey, wxConf.corpId);

export async function authRedirectUri(ctx) {
  try {
    const userObj = await loginWechatUser(ctx.query.code, ctx.query.state);
    if (userObj.errcode !== 0) return `Smartwin登录失败, 原因：${userObj.errcode}`;
    return `Smarwtin登录成功! Welcome ${userObj.userid}`;
  } catch (error) {
    debug(`authCallback() Error: ${error}`);
  }
}

export async function appRegister(ctx) {
  try {
    if (ctx.query.echostr) return cryptor.decrypt(ctx.query.echostr).message;
  } catch (error) {
    debug(`appRegister() Error: ${error}`);
  }
}
