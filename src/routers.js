const debug = require('debug')('routers');
import * as funds from './api/funds';
import * as marketData from './api/marketData';
import * as instruments from './api/instruments';
import * as wechat from './api/wechat';
import * as auth from './api/auth';
import * as users from './api/users';
const apiRouter = require('koa-router')({ prefix: '/api' });

apiRouter
  .get('/public', async ctx => { ctx.body = 'Public API. No need of JWT token';})
  .get('/public/wechat/app/register', async ctx => { ctx.body = await wechat.appRegister(ctx); })
  .get('/public/auth/wechat', async ctx => {
    const code = ctx.query.code;
    const state = ctx.query.state;
    ctx.body = await auth.getTokenByWechatScan(code, state);
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
    ctx.body = await users.getViewerData(userid);
  })
  .put('/users/:userid/password', async ctx => {
    const password = ctx.request.body.password;
    const newPassword = ctx.request.body.newPassword;
    const userid = ctx.state.user.userid;
    ctx.body = await users.setDbUserPassword(userid, newPassword, password);
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
  .get('/marketdata/candlestick/:insid', async ctx => {
    ctx.body = await marketData.getCandleStick();
  })
  .get('/marketdata/avg/:insid/:days/:col', async ctx => { ctx.body = await marketData.getAvg();})
  .get('/marketdata/ma', async ctx => { ctx.body = await marketData.getAllMA();})
  ;

export { apiRouter };
