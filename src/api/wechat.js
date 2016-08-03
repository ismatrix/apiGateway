const debug = require('debug')('api:wechat');
import { wechatConfig as wxConf } from '../config';
// import WXBizMsgCrypt from 'wechat-crypto';
import makeQydev from '../sw-weixin-qydev';

const qydev = makeQydev(wxConf);

// const cryptor = new WXBizMsgCrypt(wxConf.token, wxConf.encodingAESKey, wxConf.corpId);

export async function appRegister(ctx) {
  try {
    // if (ctx.query.echostr) return cryptor.decrypt(ctx.query.echostr).message;
    if (ctx.query.echostr) return qydev.decrypt(ctx.query.echostr).message;
  } catch (error) {
    debug('appRegister() Error: %o', error);
  }
}

export async function sendMessage(message) {
  try {
    await qydev.sendMessage(message);
    return { ok: true };
  } catch (error) {
    debug('appRegister() Error: %o', error);
  }
}
