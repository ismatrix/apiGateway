const debug = require('debug')('koa');
import Boom from 'boom';
import http from 'http';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import jwt from 'koa-jwt';
import logger from 'koa-logger';
import compose from 'koa-compose';
import { koaError } from './errors';
import cors from 'kcors';
import { apiRouter } from './httpRouters';
import socketio from 'socket.io';
import ioRouter from './ioRouter';
import * as mongodb from './mongodb';
import { jwtSecret, mongoUrl } from './config';
import serve from 'koa-static';
import mount from 'koa-mount';

debug('API Gateway starting...');
mongodb.connect(mongoUrl);

const koa = new Koa();
const server = http.createServer(koa.callback());

// ioRouter
export const io = socketio(server);
ioRouter(io);

// Koa koa REST API middleware
koa.use(logger());
koa.use(cors());
koa.use(koaError);
koa.use(jwt({ secret: jwtSecret }).unless({ path: [/^\/api\/public/] }));
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
