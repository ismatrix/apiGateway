const debug = require('debug')('routers');
import * as funds from './api/funds';
import * as marketData from './api/marketData';
import * as instruments from './api/instruments';
import * as wechat from './api/wechat';
import * as auth from './api/auth';
import * as users from './api/users';
import send from 'koa-send';
const apiRouter = require('koa-router')({ prefix: '/api' });
const staticRouter = require('koa-router')();

apiRouter
    .get('/public', async ctx => { ctx.body = 'Public API. No need of JWT token';})
    .get('/public/wechat/app/register', async ctx => { ctx.body = await wechat.appRegister(ctx); })
    .get('/public/auth/wechat', async ctx => {
      ctx.body = await auth.getTokenByWechatScan(ctx.query.code, ctx.query.state);
    })
    .post('/public/auth/password', async ctx => {
      const userid = ctx.request.body.userid;
      const password = ctx.request.body.password;
      ctx.body = await auth.getTokenByPassword(userid, password);
    })
    ;

apiRouter
    .get('/users/:userid', async ctx => {
      const userid = ctx.state.user.userid;
      const projection = { _id: 0, userid: 1, name: 1, department: 1, email: 1, avatar: 1 };
      const user = await users.getDbUserByFilter({ userid }, projection);
      ctx.body = { data: user };
    })
    .put('/users/:userid/password', async ctx => {
      ctx.body = await users.setDbUserPassword(ctx.state.user.userid, ctx.request.body.password);
    })
    ;

apiRouter
    .get('/instruments/:mainid', instruments.getMain)
    ;

apiRouter
  .get('/fund', async ctx => { ctx.body = await funds.getFunds();})
  .get('/fund/:fundid', async ctx => { ctx.body = await funds.getFund(ctx.params.fundid);})
  .get('/fund/level', async ctx => { ctx.body = await funds.getAllPositionLevel();})
  .get('/fund/checkreport/:tradingday', async ctx => { ctx.body = await funds.checkreport();})
  .get('/fund/rtequity', async ctx => { ctx.body = await funds.getRealTimeEquity();})
  .get('/fund/equity/:fundid', async ctx => { ctx.body = await funds.getEquity();})
  .get('/fund/position/:fundid', async ctx => { ctx.body = await funds.getPosition();})
  ;

apiRouter
  .get('/marketdata/candlestick/:insid', async ctx => { ctx.body = await marketData.getCandleStick();})
  .get('/marketdata/avg/:insid/:days/:col', async ctx => { ctx.body = await marketData.getAvg();})
  .get('/marketdata/ma', async ctx => { ctx.body = await marketData.getAllMA();})
  ;


staticRouter
  .get('/index.html', async ctx => {
    await send(ctx, ctx.path, { root: `${__dirname}/../static` });
  })
  .get('/script.js', async ctx => {
    await send(ctx, ctx.path, { root: `${__dirname}/../static` });
  })
  ;

export { apiRouter, staticRouter };
