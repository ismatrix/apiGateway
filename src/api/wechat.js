import createDebug from 'debug';
import createQydev from 'sw-weixin-qydev';
import { wechatConfig as wxConf } from '../config';

const debug = createDebug('api:wechat');
const qydev = createQydev(wxConf);

export async function app12Callback(ctx) {
  try {
    if (ctx.query.echostr) return qydev.decrypt(ctx.query.echostr).message;
  } catch (error) {
    debug('appRegister() Error: %o', error);
    throw error;
  }
}

export async function app13Callback(ctx) {
  try {
    if (ctx.query.echostr) return qydev.decrypt(ctx.query.echostr).message;
  } catch (error) {
    debug('appRegister() Error: %o', error);
    throw error;
  }
}

export async function sendMessage(text, to) {
  try {
    await qydev.text(text).to(to).send();

    return { ok: true };
  } catch (error) {
    debug('sendMessage() Error: %o', error);
    throw error;
  }
}
