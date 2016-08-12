# Description
smartwin mongodb tools - including insert,update,remove and query for collections.
***
## Mongodb CRUD Tools
what | where
--------- | -------------
product module | sw-mongodb-crud/product.js
instrument module | sw-mongodb-crud/instrument.js

## Basic Functions
function | description
--------- | -------------
getList | Obtain an product list from collection by Specified filter
getById | Obtain an product object by Specified unique id
add | add an new record into collection
set | update an record's column value by specified unique id
remove | delete an record by specified unique id
# Installation
```shell
npm install sw-mongodb-crud --save
```
# QuickStart
```shell
DEBUG=*,-babel node test.js
```
```javascript
require('babel-register');
const product = require('./product');
product.runTest();
const instrument = require('./instrument');
instrument.runTest();
```
# Module Description
## product
### getList
> get product list from PRODUCT collection

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | filter | JsonObject | Query filter documents specify the conditions that determine which records to select for return
return | products | JsonObject | including count and data array
* #### Example
```javascript
const filter = { exchangeid: 'SHFE', productid: 'ru' };
const products = await getList(filter);
debug('product.getList:', products);
```
return the following document
```javascript
{ count: 1,
  data:
   [ {
       exchangeid: 'SHFE',
       productid: 'ru',
       productname: '天然橡胶',
       volumemultiple: 10,
       dominantid: 'ru1609',
       dominantopeninterest: 267640
    } ]
}
```
### getById
> Obtain one product object by Specified productid.

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | productid | string | unique id for product collection
return | product | JsonObject | product document content.
* #### Example
```javascript
const product = await getById('IF');
debug('product.getById', product);
```
return the following document
```javascript
{ _id: 5770e1b0a700c0b1b6a178ee,
  closedealtype: '0',
  exchangeid: 'CFFEX',
  exchangeproductid: '',
  maxlimitordervolume: 100,
  maxmarketordervolume: 50,
  minlimitordervolume: 1,
  minmarketordervolume: 1,
  mortgagefunduserange: '0',
  positiondatetype: '2',
  positiontype: '2',
  pricetick: 0.2,
  productclass: '1',
  productid: 'IF',
  productname: '沪深300指数',
  requestid: 11,
  tradecurrencyid: 'CNY',
  underlyingmultiple: 0,
  update_date: '2016-07-20 08:42:56',
  volumemultiple: 300
}
```
### add
> insert  single or multiple product documents into product collection.

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | docArray | JsonArray | product document content
return | result | JsonObject | return value and count for inserted
* #### Example
```javascript
const retadd = await add(
  [
    { productid: 'IC', exchangeid: 'CFFEX', productname: '沪深300指数' },
    { productid: 'IF', exchangeid: 'CFFEX', productname: '中证500指数' }
  ]
);
debug('product.add', retadd);
```
return the following document
```javascript
{ ok: 1, n: 2 }
```
### set
> update an product documents by Specified product id.

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | productid | string | unique id for product collection
param | keyvalue | JsonObject | The modifications to apply
return | result | JsonObject | return value and count for update
* #### Example
```javascript
const retset = await set('IC', { exchangeid: 'CFFEX', productname: '沪深300指数' });
debug('product.set', retset);
```
return the following document
```javascript
{ ok: 1, nModified: 1, n: 1 }
```
### remove
> remove an product documents by Specified product id.

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | productid | string | unique id for product collection
return | result | JsonObject | return value and count for delete
* #### Example
```javascript
const retremove = await remove('au');
debug('product.remove', retremove);
```
return the following document
```javascript
{ ok: 1, n: 1 }
```

## instrument
### getList
> get instrument list from INSTRUMENT collection

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | filter | JsonObject | Query filter documents specify the conditions that determine which records to select for return
return | instruments | JsonObject | including count and data array
* #### Example
```javascript
const filter = { rank: [1, 2], product: ['ru'] };
const instruments = await getList(filter);
debug('instrument.getList:', instruments.count);
```
return the following document
```javascript
{ count: 2,
  data:
   [ { exchangeid: 'SHFE',
       instrumentid: 'ru1609',
       instrumentname: '天然橡胶1609',
       istrading: 1,
       productclass: '1',
       productid: 'ru',
       volumemultiple: 10,
       rank: 1 },
     { exchangeid: 'SHFE',
       instrumentid: 'ru1701',
       instrumentname: '天然橡胶1701',
       istrading: 1,
       productclass: '1',
       productid: 'ru',
       volumemultiple: 10,
       rank: 2 }
    ]
}
```
### getListByRank
> get instrument list by specified ranks

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | ranks | number | instruments ranking
return | instruments | JsonObject | including count and data array
* #### Example
```javascript
const instruments = await getListByRank(1);
debug('instrument.getListByRank:', instruments);
```
return the following document
```javascript
{ count: 52,
  data:
   [ { exchangeid: 'SHFE',
       instrumentid: 'ru1609',
       instrumentname: '天然橡胶1609',
       istrading: 1,
       productclass: '1',
       productid: 'ru',
       volumemultiple: 10,
       rank: 1 },
     { exchangeid: 'SHFE',
       instrumentid: 'ag1701',
       instrumentname: '黄金1701',
       istrading: 1,
       productclass: '1',
       productid: 'ag',
       volumemultiple: 5,
       rank: 1 },
      ......
    ]
}
```
### getDominantConnectList
> get dominant connection instrument list

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
return | instruments | JsonObject | including count and data array
* #### Example
```javascript
const instruments = await getDominantConnectList();
debug('instrument.getDominantConnectList:', instruments);
```
return the following document
```javascript
{ count: 52,
  data:
   [ { exchangeid: 'SHFE',
       istrading: 1,
       productid: 'sn',
       volumemultiple: 1,
       instrumentid: 'sn0001',
       instrumentname: '锡主连',
       productclass: '8' },
     { exchangeid: 'SHFE',
       istrading: 1,
       productid: 'wr',
       volumemultiple: 10,
       instrumentid: 'wr0001',
       instrumentname: '线材主连',
       productclass: '8' },
     { exchangeid: 'SHFE',
       istrading: 1,
       productid: 'zn',
       volumemultiple: 5,
       instrumentid: 'zn0001',
       instrumentname: '锌主连',
       productclass: '8' } ,
       ......
    ]
}
```
### getProductIndexList
> get product index instrument list

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
return | instruments | JsonObject | including count and data array
* #### Example
```javascript
const instruments = await getProductIndexList();
debug('instrument.getProductIndexList:', instruments);
```
return the following document
```javascript
{ count: 52,
  data:
   [ { exchangeid: 'CZCE',
       istrading: 1,
       productid: 'FG',
       volumemultiple: 20,
       instrumentid: 'FGIDX',
       instrumentname: '玻璃指数',
       productclass: '9' },
     { exchangeid: 'CZCE',
       istrading: 1,
       productid: 'JR',
       volumemultiple: 20,
       instrumentid: 'JRIDX',
       instrumentname: '粳稻指数',
       productclass: '9' },
       ......
    ]
}
```
### getListByProduct
> get instrument list by specified product

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | productid | stringArray | product id array
param | istrading | number | if is trading now
return | instruments | JsonObject | including count and data array
* #### Example
```javascript
const instruments = await getListByProduct('ru');
debug('instrument.getListByProduct:', instruments);
```
return the following document
```javascript
{ count: 13,
  data:
   [ { exchangeid: 'SHFE',
       istrading: 1,
       productid: 'ru',
       volumemultiple: 10,
       instrumentid: 'ruIDX',
       instrumentname: '天然橡胶指数',
       productclass: '9' },
     { exchangeid: 'SHFE',
       istrading: 1,
       productid: 'ru',
       volumemultiple: 10,
       instrumentid: 'ru0001',
       instrumentname: '天然橡胶主连',
       productclass: '8' },
     ......
   ] }
```
### getById
> Obtain one instrument document object by Specified instrument id.

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | instrumentid | string | unique id for instrument collection
return | instrument | JsonObject | instrument document content.
* #### Example
```javascript
const instrument = await getById('IF1609');
debug('instrument.getById', instrument);
```
return the following document
```javascript
{ _id: 5770e1b3a700c0b1b6a17a0d,
  combinationtype: '0',
  createdate: '20160115',
  deliverymonth: 9,
  deliveryyear: 2016,
  enddelivdate: '20160919',
  exchangeid: 'CFFEX',
  exchangeinstid: 'IF1609',
  expiredate: '20160919',
  instlifephase: '1',
  instrumentid: 'IF1609',
  instrumentname: '股指1609',
  istrading: 1,
  longmarginratio: 0.4,
  maxlimitordervolume: 100,
  maxmarginsidealgorithm: '1',
  maxmarketordervolume: 0,
  minlimitordervolume: 1,
  minmarketordervolume: 1,
  opendate: '20160118',
  optionstype: '',
  positiondatetype: '2',
  positiontype: '2',
  pricetick: 0.2,
  productclass: '1',
  productid: 'IF',
  requestid: 12,
  shortmarginratio: 0.4,
  startdelivdate: '20160919',
  strikeprice: 0,
  underlyinginstrid: '',
  underlyingmultiple: 0,
  update_date: '2016-07-20 08:42:59',
  volumemultiple: 300,
  openinterest: 9365,
  preopeninterest: 8860,
  prerank: 2,
  rank: 2,
  update_rank_date: '2016-07-22 15:17:21' }
```
### add
> insert  single or multiple instrument documents into instrument collection.

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | docArray | JsonArray | instrument document content
return | result | JsonObject | return value and count for inserted
* #### Example
```javascript
const retadd = await add(
  [
    { instrumentid: 'IC1701', productid: 'IC', exchangeid: 'CFFEX', instrumentname: '沪深300指数1701' },
    { instrumentid: 'IF1701', productid: 'IF', exchangeid: 'CFFEX', instrumentname: '中证500指数1701' }
  ]
);
debug('instrument.add', retadd);
```
return the following document
```javascript
{ ok: 1, n: 2 }
```
### set
> update an instrument documents by Specified instrument id.

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | instrumentid | string | unique id for instrument collection
param | keyvalue | JsonObject | The modifications to apply
return | result | JsonObject | return value and count for update
* #### Example
```javascript
const retset = await set('IC1701', { exchangeid: 'CFFEX', instrumentname: '沪深300指数1702' });
debug('instrument.set', retset);
```
return the following document
```javascript
{ ok: 1, nModified: 1, n: 1 }
```
### remove
> remove an instrument documents by Specified instrument id.

* #### Form

form | identifier | type | description
--------- | ------------- | -------------
param | instrumentid | string | unique id for instrument collection
return | result | JsonObject | return value and count for delete
* #### Example
```javascript
const retremove = await remove('au');
debug('instrument.remove', retremove);
```
return the following document
```javascript
{ ok: 1, n: 1 }
```
