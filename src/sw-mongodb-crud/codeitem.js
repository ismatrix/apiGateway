/** @module sw-mongodb-crud/codeitem */
import * as mongodb from '../mongodb';

const debug = require('debug')('sw-mongodb-crud:codeitem');

/** The handle of CODEITEM collection */
let CODEITEM;

/**
 * init the handle of CODEITEM collection.
 * @function
 */
async function getDb() {
  try {
    const smartwin = await mongodb.getdb();
    CODEITEM = smartwin.collection('CODEITEM');
  } catch (error) {
    debug('getDb() Error:', error);
  }
}
/**
 * get codeitem list from CODEITEM collection.
 * @function
 * @param {Array} catalogs - catalog array
 * example : ['trade.action', 'trade.direction']
 * @return {Array} codeitems - codeitem documents
 * example : [{codeitemDoc1}, {codeitemDoc2}, {codeitemDoc3}, {codeitemDoc4}]
 */
export async function getList(catalogs) {
  try {
    await getDb();

    let query = {};
    if (catalogs && catalogs.length > 0) {
      query = { catalog: { $in: catalogs } };
    }
    const sort = { catalog: 1 };
    const project = { item: 0 };
    const codeitems = await CODEITEM.find(query, project).sort(sort).toArray();

    return codeitems;
  } catch (error) {
    debug('codeitem.getList() Error: %o', error);
    throw error;
  }
}
/**
 * Obtain one codeitem object by Specified catalog.
 * @function
 * @param {string} catalog - unique id for codeitem collection
 * example : 'ru'
 * @return {Object} content - codeitem document content.
 * example : { codeitemDoc }
 */
export async function get(catalog) {
  try {
    await getDb();
    const query = { catalog };
    const codeitem = await CODEITEM.findOne(query);

    return codeitem;
  } catch (error) {
    debug('codeitem.get() Error: %o', error);
    throw error;
  }
}
/**
 * Obtain one codeitem object by Specified catalog.
 * @function
 * @param {string} catalog
 * example : 'trade.action'
 * @param {string} key
 * example : 'open'
 * @return {string} itemName - codeitem name.
 * example : '开仓'
 */
export async function getName(catalog, key) {
  try {
    await getDb();
    const query = { catalog };
    const codeitem = await CODEITEM.findOne(query);

    return (codeitem && 'item' in codeitem && key in codeitem.item)
    ? codeitem.item[key] : `${catalog}.${key}`;
  } catch (error) {
    debug('codeitem.getName() Error: %o', error);
    throw error;
  }
}
/**
 * insert  single or multiple codeitem documents into codeitem collection.
 * @function
 * @param {Array.} docArray - codeitem document content.
 * example : { codeitemDoc }
 * @return {Object} result - return value and count for inserted.
 * example : { ok: 1, n: 2 }
 */
export async function add(docs) {
  try {
    await getDb();

    // debug('docs: %o', docs);
    const ret = await CODEITEM.insertMany(docs);

    return ret.result;
  } catch (error) {
    debug('codeitem.add() Error: %o', error);
    throw error;
  }
}
/**
 * update a codeitem documents by Specified catalog id.
 * @function
 * @param {string} catalog
 * example : 'fund.status'
 * @param {Object} keyvalue - The modifications to apply
 * example : { key1: value1, key2: 'value2' })
 * @return {Object} result - return value and count for update.
 * example : { ok: 1, nModified: 1, n: 1 }
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

    const ret = await CODEITEM.updateOne(filter, update, options);

    return ret.result;
  } catch (error) {
    debug('codeitem.set() Error: %o', error);
    throw error;
  }
}
/**
 * remove an codeitem documents by Specified catalog id and key.
 * @function
 * @param {string} catalog
 * example : 'trade.action'
 * @param {string} key - item.key
 * example : 'open'
 * @return {Object} result - return value and count for removed.
 * example : { ok: 1, n: 5 }
 */
export async function remove(catalog, key) {
  try {
    await getDb();
    let ret;
    if (key) {
      const itemValue = (await get(catalog)).item;
      // debug('remove.oldItemValue %o', itemValue);
      await delete itemValue[key];
      // debug('remove.newItemValue %o', itemValue);
      ret = await set(catalog, { item: itemValue });
    } else {
      const filter = { catalog };
      ret = (await CODEITEM.deleteOne(filter)).result;
    }

    return ret;
  } catch (error) {
    debug('codeitem.remove() Error: %o', error);
    throw error;
  }
}
/**
 * init codeitem collection, insert initial doc inito codeitem
 * @function
 */
// async function init() {
//   try {
//     const smartwin = await mongodb.getdb();
//     const retdel = await smartwin.collection('CODEITEM').deleteMany();
//     debug('init drop collection %o', retdel.result);
//
//     const docs = [
//       { catalog: 'fund.status', name: '基金状态', remark: '标识基金账户当前的状态或类型',
//         item: { online: '正在运行', offline: '已下线' },
//       },
//       { catalog: 'trade.direction', name: '交易下单方向', remark: '交易下单方向',
//         item: { long: '多', short: '空' },
//       },
//       { catalog: 'trade.action', name: '交易指令', remark: '交易指令开平标志',
//         item: { open: '开仓', close: '平仓', closetoday: '平今', closeyesterday: '平昨' },
//       },
//     ];
//     const ret = await add(docs);
//     // debug('codeitem.init', ret);
//
//     return ret;
//   } catch (error) {
//     debug('codeitem.init() Error: %o', error);
//     throw error;
//   }
// }
/**
 * an test function.
 * @function
 */
export async function runTest() {
  try {
    // {
    //   // codeitem.getList
    //   const filter = ['fund.status', 'trade.action'];
    //   const codeitems = await getList(filter);
    //   debug('codeitem.getList:', codeitems);
    // }
    // {
    //   // codeitem.get
    //   const codeitem = await get('fund.status');
    //   debug('codeitem.get', codeitem);
    // }
    // {
    //   // codeitem.getName
    //   const itemname = await getName('fund.status', 'online');
    //   debug('codeitem.getName', itemname);
    // }
    // {
    //   // codeitem.init
    //   const retinit = await init();
    //   debug('codeitem.init', retinit);
    // }
    // {
    //   // codeitem.add
    //   const docs = [
    //     { catalog: 'fund.test1', name: '基金测试1', remark: '基金测试1',
    //       item: { aa: 'aaaa', bb: 'bbbb', cc: 'cccc' },
    //     },
    //     { catalog: 'fund.test2', name: '基金测试2', remark: '基金测试2',
    //       item: { qq: 'qqqq', pp: 'pppp', tt: 'tttt' },
    //     },
    //   ];
    //   const retadd = await add(docs);
    //   debug('codeitem.add', retadd);
    // }
    // {
    //   // codeitem.set
    //   const retset = await set('fund.test1',
    //   { catalog: 'fund.test8', item: { aaa: 'aaaaa', bbb: 'bbbbb', ccc: 'ccccc' } });
    //   debug('codeitem.set', retset);
    // }
    // {
      // // codeitem.remove
      // const retremove1 = await remove('fund.test2', 'pp');
      // debug('codeitem.remove', retremove1);
      // const retremove2 = await remove('fund.test8');
      // debug('codeitem.remove', retremove2);
      // const retremove3 = await remove('fund.test2');
      // debug('codeitem.remove', retremove3);
    // }
    // process.exit(0);
  } catch (error) {
    debug('codeitem.runTest: %o', error);
  }
}
