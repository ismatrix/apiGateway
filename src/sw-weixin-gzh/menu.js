import createDebug from 'debug';
import fetch from 'node-fetch';
import Boom from 'boom';

const debug = createDebug('sw-weixin-gzh:menu');

async function createMenu(menu) {
  try {
    await this.getAccessToken;
    const url = `${this.prefix}/cgi-bin/menu/create?access_token=${this.accessToken}`;
    debug('getUserId url %o', url);

    const createMenuRes = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menu),
    }).then(res => res.json());
    debug('createMenu() createMenuRes: %o', createMenuRes);

    if (createMenuRes.errcode) throw Boom.notFound('gzh menu api errcode not null');

    return createMenuRes;
  } catch (error) {
    debug(`createMenu() error: ${error}`);
    throw error;
  }
}

async function getMenu() {
  try {
    await this.getAccessToken;
    const url = `${this.prefix}/cgi-bin/menu/get?access_token=${this.accessToken}`;
    debug('getMenu url %o', url);

    const getMenuRes = await fetch(url).then(res => res.json());
    debug('getMenu() getMenuRes: %o', getMenuRes);

    if (getMenuRes.errcode) throw Boom.notFound('gzh menu api errcode not null');

    return getMenuRes;
  } catch (error) {
    debug(`createMenu() error: ${error}`);
    throw error;
  }
}

async function deleteMenu() {
  try {
    await this.getAccessToken;
    const url = `${this.prefix}/cgi-bin/menu/delete?access_token=${this.accessToken}`;
    debug('deleteMenu url %o', url);

    const deleteMenuRes = await fetch(url).then(res => res.json());
    debug('deleteMenu() deleteMenuRes: %o', deleteMenuRes);

    if (deleteMenuRes.errcode) throw Boom.notFound('gzh menu api errcode not null');

    return deleteMenuRes;
  } catch (error) {
    debug(`createMenu() error: ${error}`);
    throw error;
  }
}

const menu = {
  createMenu,
  getMenu,
  deleteMenu,
};
export default menu;
