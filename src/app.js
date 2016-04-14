import * as mongodb from './mongodb';
import { createSession as createMdSession } from './mdClient';
const debug = require('debug')('app.js');
import Koa from 'koa';
const app = new Koa();
const router = require('koa-router')();
import routes from './routes';
// import convert from 'koa-convert';
import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';

mongodb.connect('mongodb://localhost:27017/test');
createMdSession();

async function insertDoc(object) {
  try {
    const db = await mongodb.getdb();
    const collection = await db.collection('test');
    const insertResult = await collection.insertOne(object);
    debug('insertResult %o', insertResult.ops);
  } catch (err) {
    debug('Error insertDoc: %s', err);
  }
}

insertDoc({ firstName: 'Victor' });

// http middleware
app.use(logger());
router.use('/', routes.routes(), routes.allowedMethods());
app.use(router.routes(), router.allowedMethods());
// app.use(bodyparser);
app.listen(3000);
