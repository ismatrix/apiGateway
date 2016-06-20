const debug = require('debug')('app');
import http from 'http';
import Koa from 'koa';
import jwt from 'koa-jwt';
import logger from 'koa-logger';
import rest from './rest';
import socketio from 'socket.io';
import * as mongodb from './mongodb';
import { jwtSecret, mongoUrl } from './config';

debug('API Gateway starting...');

const app = new Koa();
const server = http.createServer(app.callback());
const io = socketio(server);

io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' });
  debug('socket.io connection');
  socket.on('disconnect', () => {
    io.emit('user disconnected');
  });
  debug('socket.io disconnection');
});

mongodb.connect(mongoUrl);

// http middleware
app.use(logger());
app.use(jwt({ secret: jwtSecret }).unless({ path: ['/api', /^\/api\/public/] }));
app.use(rest.routes(), rest.allowedMethods());

server.listen(3000);
