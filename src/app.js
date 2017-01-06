import createDebug from 'debug';
import Boom from 'boom';
import http from 'http';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import jwt from 'koa-jwt';
import logger from 'koa-logger';
import compose from 'koa-compose';
import cors from 'kcors';
import serve from 'koa-static';
import mount from 'koa-mount';
import socketio from 'socket.io';
import mongodb from 'sw-mongodb';
import crud from 'sw-mongodb-crud';
import koaError from './errors';
import apiRouter from './httpRouters';
import ioRouter from './ioRouter';
import config from './config';

const debug = createDebug('app');
const logError = createDebug('app:error');
logError.log = console.error.bind(console);

process
  .on('uncaughtException', error => logError('process.on(uncaughtException): %o', error))
  .on('warning', warning => logError('process.on(warning): %o', warning))
  ;

debug('API Gateway starting...');
const koa = new Koa();
const server = http.createServer(koa.callback());

// ioRouter
export const io = socketio(server);

async function init() {
  try {
    // hard dependency on mongodb connection
    const dbInstance = await mongodb.getDB(config.mongodbURL);
    crud.setDB(dbInstance);

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
    debug('dbFunds %o', config.fundConfigs.map(({ fundid, canOrder }) => ({ fundid, canOrder })));
    ioRouter(io);

    // Koa koa REST API middleware
    koa.use(logger());
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
    logError('init(): %o', error);
    throw error;
  }
}
init();
