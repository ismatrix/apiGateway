const debug = require('debug')('routers');
import * as funds from './api/funds';
import * as markets from './api/markets';
import * as wechat from './api/wechat';
import * as auth from './api/auth';
import * as users from './api/users';
import { canKoa } from './acl';
const apiRouter = require('koa-router')({ prefix: '/api' });

apiRouter
  .get('/public', async ctx => { ctx.body = 'Public API. No need of JWT token';})
  .get('/public/wechat/app/register', async ctx => { ctx.body = await wechat.appRegister(ctx); })
  .get('/public/auth/wechat', async ctx => {
    try {
      const code = ctx.query.code;
      const state = ctx.query.state;
      await auth.getTokenByWechatScan(code, state);
      ctx.redirect('/api/public/wxlogin?success=true');
    } catch (error) {
      debug('/public/auth/wechat %o', error);
      ctx.redirect('/api/public/wxlogin?success=false');
    }
  })
  .post('/public/auth/password', async ctx => {
    const userid = ctx.request.body.userid.toLowerCase();
    const password = ctx.request.body.password;
    ctx.body = await auth.getTokenByPassword(userid, password);
  })
  ;

apiRouter
  .get('/users', canKoa('read', 'users'),
    async ctx => { ctx.body = await users.getUsers();})
  .get('/users/me', async ctx => {
    const userid = ctx.state.user.userid;
    ctx.body = await users.getMeProfile(userid);
  })
  .put('/users/me/password', async ctx => {
    const password = ctx.request.body.password;
    const newPassword = ctx.request.body.newPassword;
    const userid = ctx.state.user.userid;
    ctx.body = await users.setUserPassword(userid, newPassword, password);
  })
  ;

apiRouter
  .get('/funds', async ctx => { ctx.body = await funds.getFunds(); })
  .get('/funds/:fundid', async ctx => { ctx.body = await funds.getFundById(ctx.params.fundid);})
  .get('/funds/level', async ctx => { ctx.body = await funds.getAllPositionLevel();})
  .get('/funds/checkreport/:tradingday', async ctx => { ctx.body = await funds.checkreport();})
  .get('/funds/rtequity', async ctx => { ctx.body = await funds.getRealTimeEquity();})
  .get('/funds/equity/:fundid', async ctx => { ctx.body = await funds.getEquity();})
  .get('/funds/position/:fundid', async ctx => { ctx.body = await funds.getPosition();})
  ;

apiRouter
  .get('/markets/futures/contracts', async ctx => {
    ctx.body = await markets.getFuturesContracts();
  })
  .post('/markets/futures/quotes', async ctx => {
    const symbol = ctx.request.body.symbol;
    const resolution = ctx.request.body.resolution;
    const startDate = ctx.request.body.startDate;
    const endDate = ctx.request.body.endDate;
    ctx.body = await markets.getFuturesQuotes(symbol, resolution, startDate, endDate);
  })
  .post('/markets/futures/indicators/bullbeartrend', async ctx => {
    const startDate = ctx.request.body.startDate;
    const endDate = ctx.request.body.endDate;
    const symbols = ctx.request.body.symbols;
    ctx.body = await markets.getIndicesTrend(symbols, startDate, endDate);
  })
  ;

export { apiRouter };
