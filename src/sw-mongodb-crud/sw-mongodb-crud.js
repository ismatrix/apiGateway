import { mongoUrl } from './config';
import * as mongodb from '../mongodb';

const debug = require('debug')('sw-mongodb-crud');

mongodb.connect(mongoUrl);

export * as product from './product';
export * as instrument from './instrument';
export * as fund from './fund';
