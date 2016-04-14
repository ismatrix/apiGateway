const router = require('koa-router')();

router.get('/', async ctx => {
  ctx.body = 'this a users response!';
  ctx.status = 200;
});

// router.get('/api/error', async ctx => {
//   throw new Error('Hurr durr!');
// });

export default router;
