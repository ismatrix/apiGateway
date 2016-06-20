
export async function koaError(ctx, next) {
  try {
    await next();
  } catch (error) {
    ctx.status = error.status || 500;
    ctx.type = 'application/json';
    ctx.body = JSON.stringify({
      success: false,
      message: error.stack,
    });

    ctx.app.emit('error', error, this);
  }
}
