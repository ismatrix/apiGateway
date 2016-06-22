
export async function koaError(ctx, next) {
  try {
    await next();
    ctx.type = 'application/json';
    ctx.status = ctx.body.error ? ctx.body.error.code : 200;
  } catch (error) {
    ctx.status = error.status || 500;
    ctx.type = 'application/json';
    const error = {
      code: ctx.status,
      message: error.stack,
    };
    ctx.body = JSON.stringify({ error });

    ctx.app.emit('error', error, this);
  }
}
