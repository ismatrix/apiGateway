const debug = require('debug')('app');
import http from 'http';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import jsonResObj from 'koa-json';
import jwt from 'koa-jwt';
import logger from 'koa-logger';
import compose from 'koa-compose';
import { koaError } from './errors';
import cors from 'kcors';
import { apiRouter } from './routers';
import socketio from 'socket.io';
import * as mongodb from './mongodb';
import { jwtSecret, mongoUrl } from './config';
import serve from 'koa-static';
import mount from 'koa-mount';

debug('API Gateway starting...');

const app = new Koa();
const server = http.createServer(app.callback());
export const io = socketio(server);

io.on('connection', (socket) => {
  debug('Socket Connected, socket unique ID: %o', socket.id);
  socket.on('disconnect', () => {
    debug('Socket disconnected, unique ID: %o', socket.id);
  });
});

mongodb.connect(mongoUrl);

const clientMw = compose([cors(), serve(`${__dirname}/../static/client/`)]);
const docMw = compose([cors(), serve(`${__dirname}/../static/apidoc/`)]);
// http middleware
app.use(logger());
app.use(koaError);
app.use(jwt({ secret: jwtSecret }).unless({ path: [/^\/api\/public/] }));
app.use(mount('/api/public/client', clientMw));
app.use(mount('/api/public/doc', docMw));
app.use(cors());
app.use(bodyParser());
app.use(jsonResObj());
app.use(apiRouter.routes(), apiRouter.allowedMethods());

server.listen(3000);
