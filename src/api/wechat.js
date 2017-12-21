import logger from 'sw-common';
import Boom from 'boom';
import createQydev from 'sw-weixin-qydev';
import config from '../config';

const qydev = createQydev(config.wechatConfig);

export async function app12Callback(ctx) {
  try {
    logger.debug('ctx %j', ctx);
    if (ctx.query.echostr) return qydev.decrypt(ctx.query.echostr).message;
  } catch (error) {
    logger.error('appRegister(): %j', error);
    throw error;
  }
}

export async function app13Callback(ctx) {
  try {
    logger.debug('ctx %j', ctx);
    if (ctx.query.echostr) return qydev.decrypt(ctx.query.echostr).message;
  } catch (error) {
    logger.error('appRegister(): %j', error);
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
    logger.error('sendMessage(): %j', error);
    throw error;
  }
}
