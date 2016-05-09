import * as mongodb from './mongodb';
import { createIceClient } from './iceClient';
const debug = require('debug')('app.js');
import Koa from 'koa';
const app = new Koa();
import rest from './rest';
// import convert from 'koa-convert';
// import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';

const mongoUrl = 'mongodb://localhost:27017/smartwin';
mongodb.connect(mongoUrl);

// createMdSession();
const iceUrl = 'DemoGlacier2/router:tcp -p 4502 -h code.invesmart.net';
const mdClient = createIceClient(iceUrl, 'MD');

async function subscribe() {
  try {
    await mdClient.createSession();
    mdClient.subscribeMd('FG606', 'M');
    // debug('result from subscribeMd %o', res);
    mdClient.subscribeMd('IF1606', 'M');
    mdClient.subscribeMd('FG606', 'T');
    mdClient.subscribeMd('IF1604', 'T');
    mdClient.subscribeMd('IF1605', 'T');
    mdClient.subscribeMd('IF1606', 'T');
    mdClient.subscribeMd('IC1605', 'T');
    mdClient.subscribeMd('IC1606', 'T');
    mdClient.subscribeMd('IH1605', 'T');
  } catch (error) {
    debug('Error subscribe() : %s', error);
  }
}
subscribe();

// http middleware
app.use(logger());
app.use(rest.routes(), rest.allowedMethods());
// app.use(bodyparser);
app.listen(3000);
