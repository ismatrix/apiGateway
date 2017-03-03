import createDebug from 'debug';
import Boom from 'boom';
import createQydev from 'sw-weixin-qydev';
import config from '../config';

const debug = createDebug('app:api:wechat');
const logError = createDebug('app:api:wechat:error');
logError.log = console.error.bind(console);

const qydev = createQydev(config.wechatConfig);

export async function app12Callback(ctx) {
  try {
    debug('ctx %o', ctx);
    if (ctx.query.echostr) return qydev.decrypt(ctx.query.echostr).message;
  } catch (error) {
    logError('appRegister(): %o', error);
    throw error;
  }
}

export async function app13Callback(ctx) {
  try {
    debug('ctx %o', ctx);
    if (ctx.query.echostr) return qydev.decrypt(ctx.query.echostr).message;
  } catch (error) {
    logError('appRegister(): %o', error);
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
    logError('sendMessage(): %o', error);
    throw error;
  }
}
