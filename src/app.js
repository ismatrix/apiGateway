import * as mongodb from './mongodb';
const debug = require('debug')('app.js');
import Koa from 'koa';
const app = new Koa();
import rest from './rest';
import jwt from 'koa-jwt';
import { jwtSecret } from './config';
// import convert from 'koa-convert';
// import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';

debug('API Gateway starting...');

const mongoUrl = 'mongodb://localhost:27017/smartwin';
mongodb.connect(mongoUrl);

// http middleware
app.use(logger());
app.use(jwt({ secret: jwtSecret })
.unless({ path: ['/api', '/api/wechat/auth', '/api/createLoginToken'] }));
app.use(rest.routes(), rest.allowedMethods());
// app.use(bodyparser);
app.listen(3000);
