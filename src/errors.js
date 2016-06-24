const debug = require('debug')('errors');

export async function koaError(ctx, next) {
  try {
    await next();
  } catch (error) {
    if (error.isBoom) {
      debug('error %o', error.output);
      ctx.status = error.output.statusCode;
      ctx.body = error.output.payload;
      return;
    } else if (error.status === 401 && error.message === `Invalid token\n`) {
      ctx.status = 401;
      ctx.body = {
        statusCode: ctx.status,
        error: 'Unauthorized',
        message: 'Invalid token',
      };
      return;
    } else if (ctx.status === 404 && error.message === `No authentication token found\n`) {
      ctx.status = 404;
      ctx.body = {
        statusCode: ctx.status,
        error: 'Not Found',
        message: 'Missing token',
      };
      return;
    }
    ctx.status = 500;
    ctx.body = {
      statusCode: ctx.status,
      error: 'Internal Server Error',
      message: error.message,
    };
    debug('erros %s', error.message);
  }
}
