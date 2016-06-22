const debug = require('debug')('errors');

export async function koaError(ctx, next) {
  try {
    await next();
  } catch (error) {
    if (error.status === 401) {
      ctx.body = { error: { code: 401, message: error.message } };
    } else {
      ctx.status = error.status || 500;
      ctx.body = { error: { code: ctx.status, message: error.message } };
    }
    debug('erros %s', error.message);
  }
}
