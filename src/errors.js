import createDebug from 'debug';

const logError = createDebug('app:errors:error');
logError.log = console.error.bind(console);

export default function koaError() {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      if (error.isBoom) {
        logError('koaError(): %o', error.output);
        ctx.status = error.output.statusCode;
        ctx.body = { ok: false, error: error.output.payload.message };
        return;
      } else if (error.status === 401 && error.message === 'Invalid token\n') {
        logError('koaError(): %o', error);
        ctx.status = 401;
        ctx.body = {
          ok: false,
          error: 'Invalid token',
        };
        return;
      } else if (ctx.status === 404 && error.message === 'No authentication token found\n') {
        logError('koaError(): %o', error);
        ctx.status = 404;
        ctx.body = {
          ok: false,
          error: 'Missing token',
        };
        return;
      }
      logError('koaError(): %o', error);
      ctx.status = 500;
      ctx.body = {
        ok: false,
        error: error.message || error,
      };
    }
  };
}
