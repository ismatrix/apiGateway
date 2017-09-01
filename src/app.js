import Boom from 'boom';
import http from 'http';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import jwt from 'koa-jwt';
import klogger from 'koa-logger';
import compose from 'koa-compose';
import cors from 'kcors';
import serve from 'koa-static';
import mount from 'koa-mount';
import socketio from 'socket.io';
import mongodb from 'sw-mongodb';
import crud from 'sw-mongodb-crud';
import can from 'sw-can';
import koaError from './errors';
import apiRouter from './httpRouters';
import ioRouter from './ioRouter';
import config from './config';
import logger from 'sw-common';

// 链数据库获取基金信息
// 启动ｗｅｂ服务
process
  .on('uncaughtException', error => logger.error('process.on(uncaughtException): %j', error))
  .on('warning', warning => logger.error('process.on(warning): %j', warning))
  ;

logger.info('API Gateway starting...');
const koa = new Koa();
const server = http.createServer(koa.callback());

// ioRouter
export const io = socketio(server);

async function init() {
  try {
    // hard dependency on mongodb connection
    const dbInstance = await mongodb.getDB(config.mongodbURL);
    crud.setDB(dbInstance);

    // init can module with ACL
    const acl = await dbInstance.collection('ACL').find().toArray();
    can.init({ jwtSecret: config.jwtSecret, acl });

    const dbFunds = await crud.fund.getList({ state: 'online' }, {});

    const fundConfigs = dbFunds.map(dbFund => ({
      serviceName: 'smartwinFuturesFund',
      fundid: dbFund.fundid,
      server: {
        ip: 'funds.invesmart.net',
        port: '50051',
      },
      jwtoken: config.jwtoken,
      canOrder: dbFund.fundflag === 'simulation',
    }));
    config.fundConfigs = fundConfigs;
    logger.info('dbFunds %j', config.fundConfigs.map(({ fundid, canOrder }) => ({ fundid, canOrder })));
    ioRouter(io);

    // Koa koa REST API middleware
    koa.use(klogger());
    koa.use(cors());
    koa.use(koaError());
    koa.use(jwt({ secret: config.jwtSecret }).unless({ path: [/^\/api\/public/] }));
    koa.use(bodyParser());
    koa.use(apiRouter.routes());
    koa.use(apiRouter.allowedMethods({
      throw: true,
      notImplemented: () => Boom.notImplemented('Method not implemented'),
      methodNotAllowed: () => Boom.methodNotAllowed('Method not allowed'),
    }));

    // Static files middleware
    const clientMw = compose([cors(), serve(`${__dirname}/../static/client/`)]);
    const docMw = compose([cors(), serve(`${__dirname}/../static/apidoc/`)]);
    const wxCloseMw = compose([cors(), serve(`${__dirname}/../static/wxlogin/`)]);
    koa.use(mount('/api/public/client', clientMw));
    koa.use(mount('/api/public/doc', docMw));
    koa.use(mount('/api/public/wxlogin', wxCloseMw));

    server.listen(3000);
  } catch (error) {
    logger.error('init(): %j', error);
    throw error;
  }
}
init();
