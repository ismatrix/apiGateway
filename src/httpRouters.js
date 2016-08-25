import createDebug from 'debug';
import * as funds from './api/funds';
import * as markets from './api/markets';
import * as wechat from './api/wechat';
import * as auth from './api/auth';
import * as users from './api/users';
import * as codeitem from './api/codeitem';
import { canKoa } from './acl';

const debug = createDebug('routers');
const apiRouter = require('koa-router')({ prefix: '/api' });

apiRouter
  .get('/public', async ctx => { ctx.body = 'Public API. No need of JWT token'; })
  .get('/public/weixin/qy/id=12/callback', async ctx => {
    ctx.body = await wechat.app12Callback(ctx);
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
  .get('/codeitem/catalogs', async ctx => {
    const catalogs = ctx.query.catalogs;
    ctx.body = await codeitem.getCatalogs(catalogs);
  })
  .post('/codeitem/catalogs', async ctx => {
    const catalogs = ctx.request.body.catalogs;
    ctx.body = await codeitem.postCatalogs(catalogs);
  })
  .get('/codeitem/:catalog', async ctx => {
    const catalog = ctx.params.catalog;
    ctx.body = await codeitem.getCatalog(catalog);
  })
  .put('/codeitem/:catalog', async ctx => {
    const catalog = ctx.params.catalog;
    ctx.body = await codeitem.putCatalog(catalog);
  })
  .get('/codeitem/:catalog/items', async ctx => {
    const catalog = ctx.params.catalog;
    ctx.body = await codeitem.getCatalogItems(catalog);
  })
  .post('/codeitem/:catalog/items', async ctx => {
    const catalog = ctx.params.catalog;
    const items = ctx.request.body.items;
    ctx.body = await codeitem.postCatalogItems(catalog, items);
  })
  .get('/codeitem/:catalog/items/:item', async ctx => {
    const catalog = ctx.params.catalog;
    const item = ctx.params.item;
    ctx.body = await codeitem.getCatalogItem(catalog, item);
  })
  .put('/codeitem/:catalog/items/:item', async ctx => {
    const catalog = ctx.params.catalog;
    const item = ctx.params.item;
    ctx.body = await codeitem.putCatalogItem(catalog, item);
  })
  ;

apiRouter
  .get('/funds', async ctx => { ctx.body = await funds.getFunds(); })
  .get('/funds/:fundid', async ctx => { ctx.body = await funds.getFundById(ctx.params.fundid); })
  ;

apiRouter
  .post('/markets/futures/contracts', async ctx => {
    const ranks = ctx.request.body.ranks;
    const exchanges = ctx.request.body.exchanges;
    const symbols = ctx.request.body.symbols;
    const productClasses = ctx.request.body.productClasses;
    const isTrading = ctx.request.body.isTrading;
    ctx.body = await markets.getFuturesContracts(ranks, exchanges, symbols,
      productClasses, isTrading);
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
    ctx.type = 'application/json';
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

export { apiRouter };
