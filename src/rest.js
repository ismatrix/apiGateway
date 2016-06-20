const debug = require('debug')('rest');
import * as funds from './api/funds';
import * as marketData from './api/marketData';
import * as instruments from './api/instruments';
import * as wechat from './api/wechat';
const router = require('koa-router')({ prefix: '/api' });

router.get('/', async ctx => { ctx.body = 'Welcome to SmartWin REST API';});

router
    .get('/public', async ctx => { ctx.body = 'Public API. No need of JWT token';})
    .get('/public/wechat/auth', async ctx => { ctx.body = await wechat.authRedirectUri(ctx);})
    .get('/public/wechat/app/register', async ctx => { ctx.body = await wechat.appRegister(ctx); })
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
