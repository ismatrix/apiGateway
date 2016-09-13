import createDebug from 'debug';
import fetch from 'node-fetch';
import Boom from 'boom';

const debug = createDebug('sw-weixin-gzh:user');

async function getUserOpenid(code) {
  try {
    const url = `${this.prefix}/sns/oauth2/access_token?appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;
    debug('getUserId url %o', url);
    const userIdRes = await fetch(url).then(res => res.json());
    debug('userIdRes: %o', userIdRes);

    if (userIdRes.errcode) throw Boom.notFound('gzh user api errcode not null');

    return userIdRes;
  } catch (error) {
    debug(`getUserOpenid() error: ${error}`);
    throw error;
  }
}

async function getUser(code) {
  try {
    const userOpenidObj = await this.getUserOpenid(code);
    const accessToken = userOpenidObj.access_token;
    const openID = userIdObj.openid;
    const url = `${this.prefix}/sns/userinfo?access_token=${accessToken}&openid=${openID}&lang=zh_CN`;
    const userRes = await fetch(url).then(res => res.json());
    debug('userRes: %o', userRes);

    if (userRes.errcode && userRes.errcode !== 0) {
      throw Boom.notFound('gzh user api errcode not null');
    }

    return userRes;
  } catch (error) {
    debug(`getUser() error: ${error}`);
    throw error;
  }
}

async function getFollower(openid) {
  try {
    await this.getAccessToken();

    const url = `${this.prefix}/cgi-bin/user/info?\
access_token=${this.accessToken}\
&openid=${openid}\
&lang=zh_CN`;
    debug('url %o', url);
    const followerRes = await fetch(url).then(res => res.json());
    debug('followerRes: %o', followerRes);

    if (followerRes.errcode && followerRes.errcode !== 0) {
      throw Boom.notFound('gzh user api errcode not null');
    }

    return followerRes;
  } catch (error) {
    debug(`getFollower() error: ${error}`);
    throw error;
  }
}

async function getFollowersOpenids(quantity) {
  try {
    await this.getAccessToken();

    let nextOpenid; // not implemented, usefull for >10000 openids

    const url = `${this.prefix}/cgi-bin/user/get?\
access_token=${this.accessToken}\
${nextOpenid ? '&next_openid=' : ''}\
&lang=zh_CN`;
    debug('url %o', url);

    const followersOpenidsRes = await fetch(url).then(res => res.json());
    debug('followersOpenidsRes: %o', followersOpenidsRes);

    if (followersOpenidsRes.errcode && followersOpenidsRes.errcode !== 0) {
      throw Boom.notFound('gzh user api errcode not null');
    }
    const followersOpenids = followersOpenidsRes.data.openid;
    if (quantity) followersOpenids.splice(quantity, followersOpenids.length - quantity);

    return followersOpenids;
  } catch (error) {
    debug(`getFollowersOpenids() error: ${error}`);
    throw error;
  }
}

async function getFollowers(quantity) {
  try {
    await this.getAccessToken();
    const openids = await this.getFollowersOpenids(quantity);

    const openidsGroups = [];
    const groupSize = 100;

    while (openids.length) {
      openidsGroups.push(openids.splice(0, groupSize));
    }

    const url = `${this.prefix}/cgi-bin/user/info/batchget?\
access_token=${this.accessToken}\
&lang=zh_CN`;

    const followersGroupsFetch = openidsGroups.map(openidsGroup => {
      const post = {
        user_list: openidsGroup.map(openid => ({ openid })),
      };
      const fetchOptions = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      };
      return fetch(url, fetchOptions).then(res => res.json());
    });

    const followersGroupsRes = await Promise.all(followersGroupsFetch);
    debug('followersGroupsRes: %o', followersGroupsRes);

    for (const followersGroup of followersGroupsRes) {
      if (followersGroup.errcode && followersGroup.errcode !== 0) {
        throw Boom.notFound('gzh user api errcode not null');
      }
    }

    const followers = followersGroupsRes
      .map(followersGroup => followersGroup.user_info_list)
      .reduce((acc, cur) => acc.concat(cur), [])
      ;

    return followers;
  } catch (error) {
    debug(`getFollowers() error: ${error}`);
    throw error;
  }
}

const user = {
  getUserOpenid,
  getUser,
  getFollower,
  getFollowersOpenids,
  getFollowers,
};
export default user;
