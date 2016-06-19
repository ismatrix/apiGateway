import * as funds from './api/funds';
import * as marketData from './api/marketData';
import * as instruments from './api/instruments';
import * as auth from './api/auth';
const router = require('koa-router')({ prefix: '/api' });
const debug = require('debug')('rest.js');

router.get('/', async ctx => { ctx.body = 'Welcome to SmartWin REST API';});

router
    .get('/login', instruments.getMain)
    .get('/public/createLoginToken', async ctx => { ctx.body = await auth.createLoginToken();})
    .get('/public/loggedInMessage', async ctx => { ctx.body = 'Smartwin登陆成功！';})
    .get('/public/wechat/callback',
      async ctx => { ctx.body = await auth.handleWechatCallback(ctx); })
    ;

router
    .get('/instruments/:mainid', instruments.getMain)
    ;

router
  .get('/fund', async ctx => { ctx.body = await funds.getFunds();})
  .get('/fund/:fundid', async ctx => { ctx.body = await funds.getFund(ctx.params.fundid);})
  .get('/fund/level', async ctx => { ctx.body = await funds.getAllPositionLevel();})
  .get('/fund/checkreport/:tradingday', async ctx => { ctx.body = await funds.checkreport();})
  .get('/fund/rtequity', async ctx => { ctx.body = await funds.getRealTimeEquity();})
  .get('/fund/equity/:fundid', async ctx => { ctx.body = await funds.getEquity();})
  .get('/fund/position/:fundid', async ctx => { ctx.body = await funds.getPosition();})
  ;

router
  .get('/marketdata/candlestick/:insid', async ctx => { ctx.body = await marketData.getCandleStick();})
  .get('/marketdata/avg/:insid/:days/:col', async ctx => { ctx.body = await marketData.getAvg();})
  .get('/marketdata/ma', async ctx => { ctx.body = await marketData.getAllMA();})
  ;

export default router;
