import createDebug from 'debug';
import fetch from 'node-fetch';
import Boom from 'boom';

const debug = createDebug('sw-weixin-gzh:common');

export async function getAccessToken() {
  try {
    const url = `${this.prefix}/cgi-bin/token?grant_type=client_credential&appid=${this.appID}&secret=${this.appSecret}`;
    const sixtyMinutes = 60 * 60 * 1000;

    if (!this.accessToken) {
      const accessTokenRes = await fetch(url).then(res => res.json());
      debug('getAccessToken() set accessTokenRes: %o', accessTokenRes);

      if (accessTokenRes.errcode) throw Boom.notFound('qydev common api errcode not null');

      this.accessToken = accessTokenRes.access_token;
      setTimeout(() => {
        debug('remove this.accessToken: %o', this.accessToken);
        delete this.accessToken;
      }, sixtyMinutes);
    }

    debug('existing this.accessToken %o', this.accessToken);
    return this.accessToken;
  } catch (error) {
    debug(`getAccessToken() error: ${error}`);
    throw error;
  }
}

export async function getShortURL(longURL) {
  try {
    await this.getAccessToken();
    const url = `${this.prefix}/cgi-bin/shorturl?access_token=${this.accessToken}`;

    const post = {
      action: 'long2short',
      long_url: longURL,
    };
    const fetchOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    };
    const shortURLRes = await fetch(url, fetchOptions).then(res => res.json());
    debug('shortURLRes is %o', shortURLRes);

    if (shortURLRes.errcode && shortURLRes.errcode !== 0) {
      throw Boom.notFound('gzh getShortURL errcode not null');
    }
    const shortURL = shortURLRes.short_url;

    return shortURL;
  } catch (error) {
    debug(`getShortURL() error: ${error}`);
    throw error;
  }
}

const common = {
  getAccessToken,
  getShortURL,
};
export default common;
