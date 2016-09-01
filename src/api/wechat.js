import createDebug from 'debug';
import { wechatConfig as wxConf } from '../config';
import makeQydev from '../sw-weixin-qydev';

const debug = createDebug('api:wechat');
const qydev = makeQydev(wxConf);

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
    await qydev.text(text).toGroup(to).send();

    return { ok: true };
  } catch (error) {
    debug('sendMessage() Error: %o', error);
    throw error;
  }
}
