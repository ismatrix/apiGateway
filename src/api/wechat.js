import createDebug from 'debug';
import Boom from 'boom';
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

export async function sendMessage({ from = 14, to, text }) {
  try {
    if (!to) throw Boom.badRequest('Missing to parameter');
    if (!text) throw Boom.badRequest('Missing text parameter');

    await qydev.createMessage()
      .from(from)
      .to(to)
      .text(text)
      .send();

    return { ok: true };
  } catch (error) {
    debug('sendMessage() Error: %o', error);
    throw error;
  }
}
