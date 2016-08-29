const debug = require('debug')('errors');

export default async function koaError(ctx, next) {
  try {
    await next();
  } catch (error) {
    if (error.isBoom) {
      debug('error %o', error.output);
      ctx.status = error.output.statusCode;
      ctx.body = { ok: false, error: error.output.payload.message };
      return;
    } else if (error.status === 401 && error.message === `Invalid token\n`) {
      debug('error %o', error);
      ctx.status = 401;
      ctx.body = {
        ok: false,
        error: 'Invalid token',
      };
      return;
    } else if (ctx.status === 404 && error.message === `No authentication token found\n`) {
      debug('error %o', error);
      ctx.status = 404;
      ctx.body = {
        ok: false,
        error: 'Missing token',
      };
      return;
    }
    debug('error %o', error);
    ctx.status = 500;
    ctx.body = {
      ok: false,
      error: error.message || error,
    };
  }
}
