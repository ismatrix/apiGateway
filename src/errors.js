const debug = require('debug')('errors');

export async function koaError(ctx, next) {
  try {
    await next();
  } catch (error) {
    if (error.isBoom) {
      debug('error %o', error.output);
      ctx.status = error.output.statusCode;
      ctx.body = error.output.payload;
    } else {
      ctx.status = error.status || 500;
      ctx.body = {
        statusCode: ctx.status,
        error: 'Internal Server Error',
        message: error.message,
      };
    }
    debug('erros %s', error.message);
  }
}
