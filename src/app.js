const debug = require('debug')('app');
import http from 'http';
import Koa from 'koa';
import send from 'koa-send';
import jwt from 'koa-jwt';
import logger from 'koa-logger';
import rest from './rest';
import socketio from 'socket.io';
import * as mongodb from './mongodb';
import { jwtSecret, mongoUrl } from './config';
const staticRouter = require('koa-router')();

debug('API Gateway starting...');

const app = new Koa();
const server = http.createServer(app.callback());
export const io = socketio(server);

io.on('connection', (socket) => {
  debug('Socket Connected, socket unique ID: %o', socket.id);
  // io.to(socket.id).emit('token', { token: 'Im the token' });
  socket.on('disconnect', () => {
    debug('Socket disconnected, unique ID: %o', socket.id);
  });
});

mongodb.connect(mongoUrl);

staticRouter.get('/index.html',
  async ctx => { await send(ctx, ctx.path, { root: `${__dirname}/static` });},
);
staticRouter.get('/script.js',
  async ctx => { await send(ctx, ctx.path, { root: `${__dirname}/static` });},
);

// http middleware
app.use(logger());
app.use(staticRouter.routes(), staticRouter.allowedMethods());
app.use(jwt({ secret: jwtSecret }).unless({ path: ['/api', /^\/api\/public/] }));
app.use(rest.routes(), rest.allowedMethods());

server.listen(3000);
