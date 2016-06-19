const debug = require('debug')('wechat.js');
import { wechatConfig as wxConf } from '../config';
import WXBizMsgCrypt from 'wechat-crypto';
import { loginWechatUser } from '../auth';

const cryptor = new WXBizMsgCrypt(wxConf.token, wxConf.encodingAESKey, wxConf.corpId);

export async function authCallback(ctx) {
  try {
    const isValidUser = await loginWechatUser(ctx.query.code, ctx.query.code);
    const loginSuccess = 'Smarwtin登录成功!';
    const loginFail = 'Smartwin登录失败';
    return isValidUser === true ? loginSuccess : loginFail;
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
