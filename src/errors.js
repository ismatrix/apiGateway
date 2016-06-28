const debug = require('debug')('errors');

export async function koaError(ctx, next) {
  try {
    await next();
  } catch (error) {
    if (error.isBoom) {
      debug('error %o', error.output);
      ctx.status = error.output.statusCode;
      ctx.body = { ok: false, error: error.output.payload.message };
      return;
    } else if (error.status === 401 && error.message === `Invalid token\n`) {
      debug('erros %s', error.message);
      ctx.status = 401;
      ctx.body = {
        ok: false,
        error: error.message,
      };
      return;
    } else if (ctx.status === 404 && error.message === `No authentication token found\n`) {
      debug('erros %s', error.message);
      ctx.status = 404;
      ctx.body = {
        ok: false,
        error: error.message,
      };
      return;
    }
    debug('erros %s', error.message);
    ctx.status = 500;
    ctx.body = {
      ok: false,
      error: error.message,
    };
  }
}
