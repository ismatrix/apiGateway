const debug = require('debug')('api:wechat');
import { wechatConfig as wxConf } from '../config';
import WXBizMsgCrypt from 'wechat-crypto';

const cryptor = new WXBizMsgCrypt(wxConf.token, wxConf.encodingAESKey, wxConf.corpId);

export async function appRegister(ctx) {
  try {
    if (ctx.query.echostr) return cryptor.decrypt(ctx.query.echostr).message;
  } catch (error) {
    debug(`appRegister() Error: ${error}`);
  }
}
