import createDebug from 'debug';
import * as wechat from './api/wechat';
import * as auth from './api/auth';
import * as users from './api/users';
import * as funds from './api/funds';
import * as accounts from './api/accounts';
import * as orders from './api/orders';
import * as trades from './api/trades';
import * as positions from './api/positions';
import * as markets from './api/markets';
import * as codemap from './api/codemap';
import { canKoa } from './acl';

const debug = createDebug('routers');
const apiRouter = require('koa-router')({ prefix: '/api' });

apiRouter
  .get('/public', async ctx => { ctx.body = 'Public API. No need of JWT token'; })
  .get('/public/weixin/qy/id=12/callback', async ctx => {
    ctx.body = await wechat.app12Callback(ctx);
  })
  .get('/public/weixin/qy/id=13/callback', async ctx => {
    ctx.body = await wechat.app13Callback(ctx);
  })
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
    const userid = ctx.request.body.userid;
    const password = ctx.request.body.password;
    ctx.body = await auth.getTokenByPassword(userid, password);
  })
  .post('/wechat/sendMessage', async ctx => {
    const text = ctx.request.body.text;
    const to = ctx.request.body.to;
    ctx.body = await wechat.sendMessage(text, to);
  })
  ;

apiRouter
  .get('/users', canKoa('read', 'users'),
    async ctx => { ctx.body = await users.getUsers(); })
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
  .get('/funds/:fundid', async ctx => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getFund(fundid);
  })
  .post('/fund', async ctx => {
    const fund = ctx.request.body.fund;
    const fundid = fund.fundid;
    ctx.body = await funds.postFund(fundid, fund);
  })
  .delete('/fund', async ctx => {
    const fundid = ctx.request.body.fundid;
    ctx.body = await funds.deleteFund(fundid);
  })
  .get('/funds/:fundid/total', async ctx => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.query.tradingday;
    ctx.body = await funds.getTotal(fundid, tradingday);
  })
  .get('/funds/:fundid/netValue', async ctx => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.query.tradingday;
    ctx.body = await funds.getNetValue(fundid, tradingday);
  })
  .get('/funds/:fundid/netValues', async ctx => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getNetValues(fundid);
  })
  .get('/funds/:fundid/fixedIncomes', async ctx => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getFixedIncomes(fundid);
  })
  .get('/funds/:fundid/appends', async ctx => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getAppends(fundid);
  })
  .get('/funds/:fundid/redemptions', async ctx => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getRedemptions(fundid);
  })
  .get('/funds/:fundid/dividends', async ctx => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getDividends(fundid);
  })
  .get('/funds/:fundid/costOuts', async ctx => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getCostOuts(fundid);
  })
  ;

apiRouter
  .get('/accounts', async ctx => {
    const fundid = ctx.query.fundid;
    ctx.body = await accounts.getAccounts(fundid);
  })
  ;

apiRouter
  .get('/orders', async ctx => {
    const fundid = ctx.query.fundid;
    const tradingday = ctx.query.tradingday;
    ctx.body = await orders.getOrders(fundid, tradingday);
  })
  .post('/order', async ctx => {
    const order = ctx.request.body;
    ctx.body = await orders.postOrder(order);
  })
  .delete('/order', async ctx => {
    const orderToDelete = ctx.request.body;
    ctx.body = await orders.deleteOrder(orderToDelete);
  })
  ;

apiRouter
  .get('/trades', async ctx => {
    const fundid = ctx.query.fundid;
    const tradingday = ctx.query.tradingday;
    ctx.body = await trades.getTrades(fundid, tradingday);
  })
  ;

apiRouter
  .get('/positions', async ctx => {
    const fundid = ctx.query.fundid;
    const tradingday = ctx.query.tradingday;
    ctx.body = await positions.getPositions(fundid, tradingday);
  })
  ;

apiRouter
  .get('/codemap/catalogs', async ctx => {
    ctx.body = await codemap.getCatalogs();
  })
  .post('/codemap/catalog', async ctx => {
    const catalog = ctx.request.body;
    const catalogKey = catalog.catalog;
    ctx.body = await codemap.postCatalog(catalogKey, catalog);
  })
  .get('/codemap/:catalogKey', async ctx => {
    const catalogKey = ctx.params.catalogKey;
    ctx.body = await codemap.getCatalog(catalogKey);
  })
  .delete('/codemap/:catalogKey', async ctx => {
    const catalogKey = ctx.params.catalogKey;
    ctx.body = await codemap.deleteCatalog(catalogKey);
  })
  .get('/codemap/:catalogKey/items', async ctx => {
    const catalogKey = ctx.params.catalogKey;
    ctx.body = await codemap.getCatalogItems(catalogKey);
  })
  .put('/codemap/:catalogKey/item', async ctx => {
    const catalogKey = ctx.params.catalogKey;
    const item = ctx.request.body;
    const itemKey = item.key;
    ctx.body = await codemap.putCatalogItem(catalogKey, itemKey, item);
  })
  .post('/codemap/:catalogKey/item', async ctx => {
    const catalogKey = ctx.params.catalogKey;
    const item = ctx.request.body;
    ctx.body = await codemap.postCatalogItem(catalogKey, item);
  })
  .get('/codemap/:catalogKey/items/:itemKey', async ctx => {
    const catalogKey = ctx.params.catalogKey;
    const itemKey = ctx.params.itemKey;
    ctx.body = await codemap.getCatalogItem(catalogKey, itemKey);
  })
  .delete('/codemap/:catalogKey/items/:itemKey', async ctx => {
    const catalogKey = ctx.params.catalogKey;
    const itemKey = ctx.params.itemKey;
    ctx.body = await codemap.deleteCatalogItem(catalogKey, itemKey);
  })
  ;

apiRouter
  .post('/markets/futures/contracts', async ctx => {
    ctx.body = await markets.getFuturesContracts(ctx.request.body);
  })
  .get('/markets/futures/products', async ctx => {
    ctx.body = await markets.getFuturesProducts();
  })
  .get('/markets/futures/products.byExchange', async ctx => {
    ctx.body = await markets.getFuturesProductsByExchange();
  })
  .post('/markets/futures/quotes', async ctx => {
    const symbol = ctx.request.body.symbol;
    const resolution = ctx.request.body.resolution;
    const startDate = ctx.request.body.startDate;
    const endDate = ctx.request.body.endDate;
    ctx.body = await markets.getFuturesQuotes(symbol, resolution, startDate, endDate);
  })
  .post('/markets/futures/indicators/bullBearTrend', async ctx => {
    const startDate = ctx.request.body.startDate;
    const endDate = ctx.request.body.endDate;
    const symbols = ctx.request.body.symbols;
    ctx.body = await markets.bullBearTrend(symbols, startDate, endDate);
  })
  .post('/markets/futures/indicators/contractDailyPriceSpeed', async ctx => {
    const symbols = ctx.request.body.symbols;
    ctx.body = await markets.contractDailyPriceSpeed(symbols);
  })
  .post('/markets/futures/lastSnapshot', async ctx => {
    const symbols = ctx.request.body.symbols;
    ctx.body = await markets.getFuturesLastSnapshot(symbols);
  })
  ;

export default apiRouter;
