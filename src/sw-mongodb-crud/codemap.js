/** @module sw-mongodb-crud/codemap */
import * as mongodb from '../mongodb';

const debug = require('debug')('sw-mongodb-crud:codemap');

/** The handle of CODEMAP collection */
let CODEMAP;

/**
 * init the handle of CODEMAP collection.
 * @function
 */
async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    CODEMAP = smartwin.collection('CODEMAP');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}
/**
 * 获取分类目录列表.
 * @function
 * @param {Object} filter - 默认为空获取catalog列表
 * @return {Array} codemaps - codemap documents
 */
export async function getList(filter = {}) {
  try {
    await getDb();

    const sort = { catalog: 1 };
    const project = { items: 0 };
    const codemaps = await CODEMAP.find(filter, project).sort(sort).toArray();

    return codemaps;
  } catch (error) {
    debug('codemap.getList() Error: %o', error);
    throw error;
  }
}
/**
 * 获取单一catalog信息
 * @function
 * @param {string} catalog - catalog unique
 * @return {Object} catalog - codemap document.
 * {catalog, name, description}
*/
export async function get(catalog) {
  try {
    await getDb();
    const query = { catalog };
    const codemap = await CODEMAP.findOne(query);

    return codemap;
  } catch (error) {
    debug('fund.get() Error: %o', error);
    throw error;
  }
}
/**
 * 获取某一分类ITEM列表.
 * @function
 * @param {string} catalog - catalog key
 * @return {Array} items - item documents
 */
export async function getItemList(catalog) {
  try {
    const codemap = await get(catalog);
    return (codemap && 'items' in codemap) ? codemap.items : [];
  } catch (error) {
    debug('codemap.getItemList() Error: %o', error);
    throw error;
  }
}

/**
 * 获取catalog.key的中文名称.
 * @function
 * @param {string} catalog
 * example : 'trade.action'
 * @param {string} key
 * example : 'open'
 * @return {string} itemName - codemap name.
 * example : '开仓'
 */
export async function getName(catalog, key, f = 'zh') {
  try {
    await getDb();
    const items = await getItemList(catalog);
    const result = items.filter(v => v.key === key);
    return (result[0] && f in result[0]) ? result[0][f] : `${catalog}.${key}`;
  } catch (error) {
    debug('codemap.getName() Error: %o', error);
    throw error;
  }
}
/**
 * 获取catalog.key的key的名称.
 * @function
 * @param {string} catalog
 * example : 'trade.action'
 * @param {string} col
 * example : 'ctp'
 * @return {string} value - 1.
 * example : '开仓'
 */
export async function getKey(catalog, col, value) {
  try {
    await getDb();
    const items = await getItemList(catalog);
    const result = items.filter(v => v[col] === value);
    return (result[0] && 'key' in result[0]) ? result[0].key : `${catalog}.${col}.${value}`;
  } catch (error) {
    debug('codemap.getKey() Error: %o', error);
    throw error;
  }
}
/**
 * 新增一个catalog类别.
 * @function
 * @param {Array.} catalogDocs - [{catalog, name, description}].
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function add(catalogDocs) {
  try {
    await getDb();
    const ret = await CODEMAP.insertMany(catalogDocs);
    return ret.result;
  } catch (error) {
    debug('codemap.add() Error: %o', error);
    throw error;
  }
}
/**
 * 在一个catalog下新增一个item类别.
 * @function
 * @param {Object.} itemDoc - { key, zh, ctp, sungard }.
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function addItem(catalog, itemDoc) {
  try {
    await getDb();
    const filter = { catalog };
    const update = {
      $addToSet: { items: itemDoc },
      $currentDate: { updatedate: true },
    };

    const ret = await CODEMAP.updateOne(
      filter,
      update,
    );

    return ret.result;
  } catch (error) {
    debug('codemap.addItem() Error: %o', error);
    throw error;
  }
}
/**
 * 更新目录信息.
 * @function
 * @param {string} catalog
 * @param {Object} keyvalue - {catalog, name, description}
 * @return {Object} result - return value and count for update.
 */
export async function set(catalog, keyvalue) {
  try {
    await getDb();

    const filter = { catalog };
    const update = {
      $set: keyvalue,
      $currentDate: { updatedate: true },
    };
    const options = {
      upsert: true,
    };
    const ret = await CODEMAP.updateOne(filter, update, options);
    return ret.result;
  } catch (error) {
    debug('codemap.set() Error: %o', error);
    throw error;
  }
}
/**
 * 更新ITEM信息.
 * @function
 * @param {string} catalog
 * @param {string} key
 * @param {Object} itemDoc - { key, zh, ctp, sungard }
 * @return {Object} result - return value and count for update.
 */
export async function setItem(catalog, key, itemDoc) {
  try {
    await getDb();

    const itemList = await getItemList(catalog);
    for (let i = 0; i < itemList.length; i++) {
      if (itemList[i].key === key) {
        itemList[i] = itemDoc;
      }
    }
    debug('%o', itemList);
    const ret = await set(catalog, { items: itemList });
    return ret;
  } catch (error) {
    debug('codemap.setItem() Error: %o', error);
    throw error;
  }
}
/**
 * 删除整个catalog
 * @function
 * @param {string} catalog
 * @return {Object} result - return value and count for removed.
 * example : { ok: 1, n: 5 }
 */
export async function remove(catalog) {
  try {
    await getDb();
    const filter = { catalog };
    const ret = await CODEMAP.deleteOne(filter);

    return ret.result;
  } catch (error) {
    debug('codemap.remove() Error: %o', error);
    throw error;
  }
}
/**
 * 删除一个catalog的item.
 * @function
 * @param {string} catalog
 * @param {string} key - item key
 * @return {Object} result - return value and count for removed.
 * example : { ok: 1, n: 5 }
 */
export async function removeItem(catalog, key) {
  try {
    await getDb();

    const itemList = await getItemList(catalog);
    for (let i = 0; i < itemList.length; i++) {
      if (itemList[i].key === key) {
        itemList.splice(i, 1);
      }
    }
    const ret = await set(catalog, { items: itemList });
    return ret;
  } catch (error) {
    debug('codemap.removeItem() Error: %o', error);
    throw error;
  }
}

/**
 * init codemap collection, insert initial doc inito codemap
 * @function
 */
async function init() {
  try {
    const smartwin = await mongodb.getdb();
    const retdel = await smartwin.collection('CODEMAP').deleteMany();
    debug('init drop collection %o', retdel.result);

    const docs = [
      {
        catalog: 'fund.status',
        name: '基金状态',
        description: '标识基金账户当前的状态或类型',
        items: [
          { key: 'online', zh: '正在运行' },
          { key: 'offline', zh: '已下线' },
          { key: 'test', zh: '测试基金' },
          { key: 'clearout', zh: '清盘' },
          { key: 'manual', zh: '未接入' },
          { key: 'pause', zh: '暂停交易' },
        ],
      },
      {
        catalog: 'trade.direction',
        name: '交易下单方向',
        description: '交易下单方向',
        items: [
        { key: 'buy', zh: '买', ctp: 0, sungard: 0 },
        { key: 'sell', zh: '卖', ctp: 1, sungard: 1 },
        ],
      },
      {
        catalog: 'position.direction',
        name: '持仓方向',
        description: '持仓方向',
        items: [
        { key: 'long', zh: '多', ctp: 2, sungard: 0 },
        { key: 'short', zh: '空', ctp: 3, sungard: 1 },
        { key: 'net', zh: '净', ctp: 1, sungard: -1 },
        ],
      },
      {
        catalog: 'trade.hedge',
        name: '投机套保标志',
        description: '投机套保标志',
        items: [
        { key: 'speculation', zh: '投机', ctp: 1, sungard: 0 },
        { key: 'arbitrage', zh: '套利', ctp: 2, sungard: 2 },
        { key: 'hedge', zh: '套保', ctp: 3, sungard: 1 },
        ],
      },
      {
        catalog: 'trade.offset',
        name: '交易开平指令',
        description: '交易指令开平标志',
        items: [
        { key: 'open', zh: '开仓', ctp: 0, sungard: 0 },
        { key: 'close', zh: '平仓', ctp: 1, sungard: 1 },
        { key: 'force', zh: '强平', ctp: 2, sungard: -1 },
        { key: 'closetoday', zh: '平今', ctp: 3, sungard: 2 },
        { key: 'closeyesterday', zh: '平昨', ctp: 4, sungard: -1 },
        { key: 'forceoff', zh: '强减', ctp: 5, sungard: -1 },
        { key: 'localforceclose', zh: '本地强平', ctp: 6, sungard: -1 },
        ],
      },
      {
        catalog: 'trade.price',
        name: '报单价格类型',
        description: '报单价格条件类型',
        items: [
        { key: 'any', zh: '任意价', ctp: 1, sungard: 1 },
        { key: 'limit', zh: '限价', ctp: 2, sungard: 0 },
        { key: 'best', zh: '最优价', ctp: 3, sungard: 2 },
        { key: 'last', zh: '最新价', ctp: 4, sungard: -1 },
        ],
      },
      {
        catalog: 'signalin.name',
        name: '信号进场名称',
        description: '委托单信号进场标识名称',
        items: [
        { key: 'first', zh: '首次进场' },
        { key: 'add', zh: '加仓' },
        ],
      },
      {
        catalog: 'signalout.name',
        name: '信号出场名称',
        description: '委托单信号出场名称',
        items: [
        { key: 'stoploss', zh: '止损' },
        { key: 'stopwin', zh: '止盈' },
        { key: 'left', zh: '仓位离场（裸奔仓）' },
        ],
      },
      {
        catalog: 'riskcontrol.name',
        name: '风控出场出名称',
        description: '委托单风控出场出名称',
        items: [
        { key: 'drawdowninday', zh: '日内回撤触发' },
        { key: 'drawdowntotal', zh: '累积回撤触发' },
        { key: 'netting', zh: '轧差触发' },
        { key: 'margin', zh: '保证金仓位触发' },
        { key: 'lever', zh: '杠杆触发' },
        { key: 'positionlimit', zh: '大户持仓触发' },
        ],
      },
      {
        catalog: 'monetary.state',
        name: '货币基金状态',
        description: '货币基金状态',
        items: [
        { key: 'valid', zh: '有效' },
        { key: 'invalid', zh: '无效' },
        { key: 'expired', zh: '过期' },
        ],
      },
    ];
    const ret = await add(docs);
    return ret;
  } catch (error) {
    debug('codemap.init() Error: %o', error);
    throw error;
  }
}
/**
 * an test function.
 * @function
 */
export async function runTest() {
  try {
    // {
    //   // codemap.getList
    //   const codemaps = await getList();
    //   debug('codemap.getList:', codemaps);
    // }
    // {
    //   // codemap.getItemList
    //   const items = await getItemList('fund.status');
    //   debug('codemap.getItemList:', items);
    // }
    // {
    //   // codemap.get
    //   const codemap = await get('fund.status');
    //   debug('codemap.get', codemap);
    // }
    // {
    //   // codemap.getName
    //   debug('codemap.getName', await getName('trade.action', 'closetoday'));
    //   debug('codemap.getName', await getName('fund.status', 'online'));
    // }
    {
      // codemap.getKey
      debug('codemap.getName', await getKey('trade.price', 'ctp', 2));
      debug('codemap.getName', await getKey('trade.offset', 'sungard', 2));
    }
    // {
    //   // codemap.init
    //   const retinit = await init();
    //   debug('codemap.init', retinit);
    // }
    // {
    //   // codemap.add
    //   const catalogs = [
    //     {
    //       catalog: 'test1.status',
    //       name: '测试状态2',
    //       description: '啊哈哈哈户当前的状态或类型',
    //     },
    //     {
    //       catalog: 'test2.status',
    //       name: '测试状态2',
    //       description: '测试状态2',
    //     },
    //   ];
    //   const retadd = await add(catalogs);
    //   debug('codemap.add', retadd);
    // }
    // {
    //   // codemap.addItem
    //   const item1 = [
    //     { key: 'a', zh: '啊' },
    //     { key: 'b', zh: '波' },
    //     { key: 'c', zh: '次' },
    //     { key: 'd', zh: '得' },
    //   ];
    //   for (let i = 0; i < item1.length; i++) {
    //     debug('codemap.addItem: %o', await addItem('test1.status', item1[i]));
    //   }
    //   const item2 = [
    //     { key: 'e', zh: '饿' },
    //     { key: 'f', zh: '风' },
    //   ];
    //   for (let i = 0; i < item2.length; i++) {
    //     debug('codemap.addItem: %o', await addItem('test2.status', item2[i]));
    //   }
    // }
    // {
    //   // codemap.set
    //   const retset1 = await set('test1.status', { catalog: 'test888.status' });
    //   const retset2 = await set('test2.status', { name: '测试改名称' });
    //   debug('codemap.set1', retset1);
    //   debug('codemap.set2', retset2);
    // }
    // {
    //   // codemap.setitem
    //   const retset1 = await setItem('test888.status', 'c', { key: 'q', zh: 'MM' });
    //   const retset2 = await setItem('test2.status', 'e', { key: 'e', zh: 'MM' });
    //   debug('codemap.set1', retset1);
    //   debug('codemap.set2', retset2);
    // }
    // {
    //   // codemap.remove item
    //   const retset1 = await removeItem('test888.status', 'q');
    //   const retset2 = await removeItem('test2.status', 'e');
    //   debug('codemap.set1', retset1);
    //   debug('codemap.set2', retset2);
    // }
    // {
    //   // codemap.remove catalog
    //   const retremove1 = await remove('test888.status');
    //   debug('codemap.remove', retremove1);
    //   const retremove2 = await remove('test2.status');
    //   debug('codemap.remove', retremove2);
    // }
    process.exit(0);
  } catch (error) {
    debug('codemap.runTest: %o', error);
  }
}
