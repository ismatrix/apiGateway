import logger from 'sw-common';
import can from 'sw-can';
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
import * as configs from './api/configs';
import * as acls from './api/acls';
import * as collections from './api/collections';
import * as strategy from './api/strategy';
import * as productGroup from './api/productGroup';

// 负责路由ｗｅｂ
const apiRouter = require('koa-router')({ prefix: '/api' });

apiRouter
  .get('/public', async (ctx) => { ctx.body = 'Public API. No need of JWT token'; })
  .get('/public/weixin/qy/id=12/callback', async (ctx) => {
    ctx.body = await wechat.app12Callback(ctx);
  })
  .get('/public/weixin/qy/id=13/callback', async (ctx) => {
    ctx.body = await wechat.app13Callback(ctx);
  })
  .get('/public/auth/wechat', async (ctx) => {
    try {
      const code = ctx.query.code;
      const state = ctx.query.state;
      await auth.getTokenByWechatScan(code, state);
      ctx.redirect('/api/public/wxlogin?success=true');
    } catch (error) {
      logger.debug('/public/auth/wechat %j', error);
      ctx.redirect('/api/public/wxlogin?success=false');
    }
  })
  .post('/public/auth/password', async (ctx) => {
    const userid = ctx.request.body.userid;
    const password = ctx.request.body.password;
    ctx.body = await auth.getTokenByPassword(userid, password);
  })
  .post('/wechat/sendMessage', async (ctx) => {
    const body = ctx.request.body;
    ctx.body = await wechat.sendMessage(body);
  })
  ;

apiRouter
  .get('/users', can.koamw('get', 'users'),
    async (ctx) => { ctx.body = await users.getUsers(); })
  .get('/users/me', async (ctx) => {
    const userid = ctx.state.user.userid;
    ctx.body = await users.getMeProfile(userid);
  })
  .put('/users/me/password', async (ctx) => {
    const password = ctx.request.body.password;
    const newPassword = ctx.request.body.newPassword;
    const userid = ctx.state.user.userid;
    ctx.body = await users.setUserPassword(userid, newPassword, password);
  })
  ;

apiRouter.use('/fund', can.koamw('get', 'fundid:all/basics'));
apiRouter.use('/funds', can.koamw('get', 'fundid:all/basics'));
apiRouter
  .get('/funds', async (ctx) => { ctx.body = await funds.getFunds(); })
  .get('/funds/maxtradingday', async (ctx) => {
    ctx.body = await funds.getMaxTradingday();
  })
  .get('/funds/:fundid', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getFund(fundid);
  })
  .post('/fund', async (ctx) => {
    const fund = ctx.request.body.fund;
    const fundid = fund.fundid;
    ctx.body = await funds.postFund(fundid, fund);
  })
  .delete('/fund', async (ctx) => {
    const fundid = ctx.request.body.fundid;
    ctx.body = await funds.deleteFund(fundid);
  })
  .get('/funds/:fundid/total', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.query.tradingday;
    ctx.body = await funds.getTotal(fundid, tradingday);
  })
  .get('/funds/:fundid/returnByDateRange', async (ctx) => {
    const fundid = ctx.params.fundid;
    const beginDate = ctx.query.beginDate;
    const endDate = ctx.query.endDate;
    ctx.body = await funds.getReturnByDateRange(fundid, beginDate, endDate);
  })
  .get('/funds/:fundid/netValue', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.query.tradingday;
    ctx.body = await funds.getNetValue(fundid, tradingday);
  })
  .get('/funds/:fundid/netValues', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getNetValues(fundid);
  })
  .get('/funds/:fundid/fixedIncomes', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getFixedIncomes(fundid);
  })
  .put('/funds/:fundid/fixedIncome/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    const fixedincome = ctx.request.body.fixedincome;
    ctx.body = await funds.putFixedIncome(fundid, tradingday, fixedincome);
  })
  .delete('/funds/:fundid/fixedIncome/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    ctx.body = await funds.deleteFixedIncome(fundid, tradingday);
  })
  .post('/funds/:fundid/equity/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    const equity = ctx.request.body.equity;
    ctx.body = await funds.postEquity(fundid, tradingday, equity);
  })
  .put('/funds/:fundid/equity/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    const equity = ctx.request.body.equity;
    ctx.body = await funds.putEquity(fundid, tradingday, equity);
  })
  .delete('/funds/:fundid/equity/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    ctx.body = await funds.deleteEquity(fundid, tradingday);
  })
  .get('/funds/:fundid/appends', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getAppends(fundid);
  })
  .put('/funds/:fundid/append/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    const append = ctx.request.body.append;
    ctx.body = await funds.putAppend(fundid, tradingday, append);
  })
  .delete('/funds/:fundid/append/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    ctx.body = await funds.deleteAppend(fundid, tradingday);
  })
  .get('/funds/:fundid/redemptions', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getRedemptions(fundid);
  })
  .put('/funds/:fundid/redemption/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    const redemption = ctx.request.body.redemption;
    ctx.body = await funds.putRedemption(fundid, tradingday, redemption);
  })
  .delete('/funds/:fundid/redemption/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    ctx.body = await funds.deleteRedemption(fundid, tradingday);
  })
  .get('/funds/:fundid/dividends', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getDividends(fundid);
  })
  .put('/funds/:fundid/dividend/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    const dividend = ctx.request.body.dividend;
    ctx.body = await funds.putDividend(fundid, tradingday, dividend);
  })
  .delete('/funds/:fundid/dividend/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    ctx.body = await funds.deleteDividend(fundid, tradingday);
  })
  .get('/funds/:fundid/costOuts', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getCostOuts(fundid);
  })
  .put('/funds/:fundid/fixedCost/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    const fixedcost = ctx.request.body.fixedcost;
    ctx.body = await funds.putFixedCost(fundid, tradingday, fixedcost);
  })
  .delete('/funds/:fundid/fixedCost/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    ctx.body = await funds.deleteFixedCost(fundid, tradingday);
  })
  .get('/funds/:fundid/hostingAccounts', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getHostingAccounts(fundid);
  })
  .put('/funds/:fundid/hostingAccount/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    const hostingaccount = ctx.request.body.hostingaccount;
    ctx.body = await funds.putHostingAccount(fundid, tradingday, hostingaccount);
  })
  .delete('/funds/:fundid/hostingAccount/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    ctx.body = await funds.deleteHostingAccount(fundid, tradingday);
  })
  .get('/funds/:fundid/stockAccounts', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getStockAccounts(fundid);
  })
  .put('/funds/:fundid/stockAccount/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    const stockaccount = ctx.request.body.stockaccount;
    ctx.body = await funds.putStockAccount(fundid, tradingday, stockaccount);
  })
  .delete('/funds/:fundid/stockAccount/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    ctx.body = await funds.deleteStockAccount(fundid, tradingday);
  })
  .get('/funds/:fundid/bondAccounts', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getBondAccounts(fundid);
  })
  .put('/funds/:fundid/bondAccount/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    const bondaccount = ctx.request.body.bondaccount;
    ctx.body = await funds.putBondAccount(fundid, tradingday, bondaccount);
  })
  .delete('/funds/:fundid/bondAccount/:tradingday', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingday = ctx.params.tradingday;
    ctx.body = await funds.deleteBondAccount(fundid, tradingday);
  })
  .get('/funds/:fundid/dynamicEquity', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getDynamicEquity(fundid);
  })
  .get('/funds/:fundid/tradingdays', async (ctx) => {
    const fundid = ctx.params.fundid;
    const tradingdayCount = parseInt(ctx.query.tradingdayCount, 10);
    ctx.body = await funds.getTradingdays(fundid, tradingdayCount);
  })
  .get('/funds/:fundid/positionLevels', async (ctx) => {
    const fundid = ctx.params.fundid;
    ctx.body = await funds.getPositionLevels(fundid);
  })
  ;

apiRouter.use('/account', can.koamw('get', 'fundid:all/basics'));
apiRouter
  .get('/account', async (ctx) => {
    const fundid = ctx.query.fundid;
    ctx.body = await accounts.getAccount(fundid);
  })
  ;

apiRouter
  .post('/signalByProduct', async (ctx) => {
    const fundid = ctx.request.body.fundid;
    const beginDate = ctx.request.body.beginDate;
    const endDate = ctx.request.body.endDate;
    const product = ctx.request.body.product;
    const instrumentid = ctx.request.body.instrumentid;
    ctx.body = await orders.getSignalByProduct(fundid, beginDate, endDate, product, instrumentid);
  })
  .post('/signalByCatalog', async (ctx) => {
    const fundid = ctx.request.body.fundid;
    const beginDate = ctx.request.body.beginDate;
    const endDate = ctx.request.body.endDate;
    const traded = ctx.request.body.traded;
    ctx.body = await orders.getSignalByCatalog(fundid, beginDate, endDate, traded);
  })
  .get('/oneDayOrders', async (ctx) => {
    const fundid = ctx.query.fundid;
    const tradingday = ctx.query.tradingday;
    ctx.body = await orders.getOneDayOrders(fundid, tradingday);
  })
  .post('/order', async (ctx) => {
    const order = ctx.request.body;
    order.userid = ctx.state.user.userid;
    ctx.body = await orders.postOrder(order, ctx.header.authorization);
  })
  .delete('/order', async (ctx) => {
    const orderToDelete = ctx.request.body;
    ctx.body = await orders.deleteOrder(orderToDelete, ctx.header.authorization);
  })
  .get('/conditionalOrders', async (ctx) => {
    const fundid = ctx.query.fundid;
    ctx.body = await orders.getConditionalOrders(fundid);
  })
  .post('/conditionalOrders', async (ctx) => {
    const condOrders = ctx.request.body;
    ctx.body = await orders.postConditionalOrders(condOrders);
  })
  .delete('/conditionalOrder/:orderID', async (ctx) => {
    const orderID = ctx.params.orderID;
    ctx.body = await orders.deleteConditionalOrder(orderID);
  })
  ;

apiRouter
  .get('/trades', async (ctx) => {
    const fundid = ctx.query.fundid;
    const tradingday = ctx.query.tradingday;
    ctx.body = await trades.getTrades(fundid, tradingday);
  })
  ;

apiRouter
  .get('/positions', async (ctx) => {
    const fundid = ctx.query.fundid;
    const beginDate = ctx.query.beginDate;
    const endDate = ctx.query.endDate;
    ctx.body = await positions.getPositions(fundid, beginDate, endDate);
  })
  .get('/oneDayPositions', async (ctx) => {
    const fundid = ctx.query.fundid;
    const tradingday = ctx.query.tradingday;
    ctx.body = await positions.getOneDayPositions(fundid, tradingday);
  })
  .get('/allFunds/allInstruments/mergedPositions', async (ctx) => {
    const tradingday = ctx.query.tradingday;
    ctx.body = await positions.getAllFundsMergedPositions(tradingday);
  })
  .get('/allFunds/oneInstrument/positions.byFund', async (ctx) => {
    const tradingday = ctx.query.tradingday;
    const symbol = ctx.query.symbol;
    ctx.body = await positions.getInstrumentPositionsByFund(tradingday, symbol);
  })
  ;

apiRouter
  .get('/codemap/catalogs', async (ctx) => {
    ctx.body = await codemap.getCatalogs();
  })
  .post('/codemap/catalog', can.koamw('add', 'codemap'), async (ctx) => {
    const catalog = ctx.request.body;
    const catalogKey = catalog.catalog;
    ctx.body = await codemap.postCatalog(catalogKey, catalog);
  })
  .get('/codemap/:catalogKey', async (ctx) => {
    const catalogKey = ctx.params.catalogKey;
    ctx.body = await codemap.getCatalog(catalogKey);
  })
  .delete('/codemap/:catalogKey', can.koamw('delete', 'codemap'), async (ctx) => {
    const catalogKey = ctx.params.catalogKey;
    ctx.body = await codemap.deleteCatalog(catalogKey);
  })
  .get('/codemap/:catalogKey/items', async (ctx) => {
    const catalogKey = ctx.params.catalogKey;
    ctx.body = await codemap.getCatalogItems(catalogKey);
  })
  .put('/codemap/:catalogKey/item', can.koamw('update', 'codemap'), async (ctx) => {
    const catalogKey = ctx.params.catalogKey;
    const item = ctx.request.body;
    const itemKey = item.key;
    ctx.body = await codemap.putCatalogItem(catalogKey, itemKey, item);
  })
  .post('/codemap/:catalogKey/item', can.koamw('add', 'codemap'), async (ctx) => {
    const catalogKey = ctx.params.catalogKey;
    const item = ctx.request.body;
    ctx.body = await codemap.postCatalogItem(catalogKey, item);
  })
  .get('/codemap/:catalogKey/items/:itemKey', async (ctx) => {
    const catalogKey = ctx.params.catalogKey;
    const itemKey = ctx.params.itemKey;
    ctx.body = await codemap.getCatalogItem(catalogKey, itemKey);
  })
  .delete('/codemap/:catalogKey/items/:itemKey', can.koamw('delete', 'codemap'), async (ctx) => {
    const catalogKey = ctx.params.catalogKey;
    const itemKey = ctx.params.itemKey;
    ctx.body = await codemap.deleteCatalogItem(catalogKey, itemKey);
  })
  ;

apiRouter
  .post('/markets/futures/contracts', async (ctx) => {
    ctx.body = await markets.getFuturesContracts(ctx.request.body);
  })
  .get('/markets/futures/products', async (ctx) => {
    ctx.body = await markets.getFuturesProducts();
  })
  .get('/markets/futures/products.byExchange', async (ctx) => {
    ctx.body = await markets.getFuturesProductsByExchange();
  })
  .post('/markets/futures/quotes', async (ctx) => {
    ctx.body = await markets.getFuturesQuotes(ctx.request.body, ctx.header.authorization);
    ctx.type = 'application/json';
  })
  .post('/markets/futures/indicators/bullBearTrend', async (ctx) => {
    const startDate = ctx.request.body.startDate;
    const endDate = ctx.request.body.endDate;
    const symbols = ctx.request.body.symbols;
    ctx.body = await markets.bullBearTrend(symbols, startDate, endDate);
  })
  .post('/markets/futures/indicators/contractDailyPriceSpeed', async (ctx) => {
    const symbols = ctx.request.body.symbols;
    ctx.body = await markets.contractDailyPriceSpeed(symbols);
  })
  .post('/markets/futures/indicators/bidaskSymbols', async (ctx) => {
    const tradingday = ctx.request.body.tradingday;
    ctx.body = await markets.getSymbolsInBidaskByTradingday(tradingday);
  })
  .post('/markets/futures/indicators/bidask', async (ctx) => {
    const tradingday = ctx.request.body.tradingday;
    const symbol = ctx.request.body.symbol;
    ctx.body = await markets.getBidAsk(tradingday, symbol);
  })
  .post('/markets/futures/indicators/bigorderSymbols', async (ctx) => {
    const tradingday = ctx.request.body.tradingday;
    ctx.body = await markets.getSymbolsInBigorderByTradingday(tradingday);
  })
  .post('/markets/futures/indicators/bigorder', async (ctx) => {
    const symbol = ctx.request.body.symbol;
    const tradingday = ctx.request.body.tradingday;
    ctx.body = await markets.getBigorder(symbol, tradingday);
  })
  .get('/markets/futures/indicators/spottitle', async (ctx) => {
    ctx.body = await markets.getSpotTitle();
  })
  .post('/markets/futures/indicators/spotdata', async (ctx) => {
    const id = ctx.request.body.id;
    const startDate = ctx.request.body.startdate;
    const endDate = ctx.request.body.enddate;
    ctx.body = await markets.getSpotDatas(id, startDate, endDate);
  })
  .post('/markets/futures/lastSnapshot', async (ctx) => {
    const symbols = ctx.request.body.symbols;
    ctx.body = await markets.getFuturesLastSnapshot(symbols);
  })
  ;

apiRouter
  .get('/configs/notifyConfigs', can.koamw('get', 'configs'), async (ctx) => {
    ctx.body = await configs.getNotifyConfigs();
  })
  .get('/configs/followingConfigs', can.koamw('get', 'configs'), async (ctx) => {
    ctx.body = await configs.getFollowingConfigs();
  })
  .post('/configs/followingConfigs', can.koamw('add', 'configs'), async (ctx) => {
    const followingConfigs = ctx.request.body.followingConfigs;
    ctx.body = await configs.postFollowingConfigs(followingConfigs);
  })
  .put('/configs/followingConfigs/:masterid', can.koamw('update', 'configs'), async (ctx) => {
    const masterid = ctx.params.masterid;
    const followingConfig = ctx.request.body.followingConfig;
    ctx.body = await configs.putFollowingConfig(masterid, followingConfig);
  })
  .delete('/configs/followingConfigs/:masterid', can.koamw('delete', 'configs'), async (ctx) => {
    const masterid = ctx.params.masterid;
    ctx.body = await configs.deleteFollowingConfig(masterid);
  })
  .get('/configs/strongweakConfigs', can.koamw('get', 'configs'), async (ctx) => {
    ctx.body = await configs.getStrongweakConfigs();
  })
  .post('/configs/strongweakConfigs', can.koamw('add', 'configs'), async (ctx) => {
    const strongweakConfigs = ctx.request.body.strongweakConfigs;
    ctx.body = await configs.postStrongweakConfigs(strongweakConfigs);
  })
  .put('/configs/strongweakConfigs/:plate', can.koamw('update', 'configs'), async (ctx) => {
    const plate = ctx.params.plate;
    const strongweakConfig = ctx.request.body.strongweakConfig;
    ctx.body = await configs.putStrongweakConfig(plate, strongweakConfig);
  })
  .delete('/configs/strongweakConfigs/:plate', can.koamw('delete', 'configs'), async (ctx) => {
    const plate = ctx.params.plate;
    ctx.body = await configs.deleteStrongweakConfig(plate);
  })
  .post('/system/shell/exec', can.koamw('add', 'configs'), async (ctx) => {
    const cmd = ctx.request.body.cmd;
    ctx.body = await configs.execShell(cmd);
  })
  ;

apiRouter
  .post('/wildcard/get/:tablename', async (ctx) => {
    const tablename = ctx.params.tablename;
    const query = ('query' in ctx.request.body) === undefined ? {} : ctx.request.body.query;
    const projection = ('projection' in ctx.request.body) === undefined ? {} : ctx.request.body.projection;
    const sort = ('sort' in ctx.request.body) === undefined ? {} : ctx.request.body.sort;
    const limit = ('limit' in ctx.request.body) === undefined ? 0 : ctx.request.body.limit;
    // logger.debug('query:%j, projection: %j', query, projection);
    ctx.body = await markets.getWildcard(tablename, query, projection, sort, limit);
  })
  .post('/wildcard/add/:tablename', async (ctx) => {
    const tablename = ctx.params.tablename;
    const wildcards = ctx.request.body.wildcards;
    ctx.body = await markets.addWildcard(tablename, wildcards);
  })
  .post('/wildcard/:tablename', async (ctx) => {
    const tablename = ctx.params.tablename;
    const query = ctx.request.body.query;
    const wildcards = ctx.request.body.wildcards;
    ctx.body = await markets.upsertWildcard(tablename, query, wildcards);
  })
  .delete('/wildcard/:tablename', async (ctx) => {
    const tablename = ctx.params.tablename;
    const query = ctx.request.body.query;
    ctx.body = await markets.removeWildcard(tablename, query);
  })
  ;

apiRouter
  .get('/collections', async (ctx) => {
    ctx.body = await collections.getCollections();
  })
  ;

apiRouter
  .get('/acls', async (ctx) => {
    ctx.body = await acls.getACLs();
  })
  ;

apiRouter
    .get('/strategies', async (ctx) => {
      ctx.body = await strategy.getStrategies();
    })
    ;

apiRouter
    .get('/productGroups', async (ctx) => {
      ctx.body = await productGroup.getProductGroups();
    })
    ;

export default apiRouter;
