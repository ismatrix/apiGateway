# sw-broker-ice
This module let you interact with wechat 公众号 API. （https://mp.weixin.qq.com/wiki）
## How to use
### config.js
```javascript
export const wechatGzhConfig = {
  encodingAESKey: 'e9e4ba5a860d272f09af90zedzdzdzc07c838c7zedzdzed',
  token: 'theToken',
  appID: 'wxe00551fbfefee8c',
  appSecret: '379b69111111111ce90efe85b',
  authorizeCallbackURL: 'https://fqdn.com/callback',
};
```
### initialize
```javascript
import createGzh from 'sw-weixin-gzh';
import { wechatGzhConfig } from '../config';
const gzh = createGzh(wechatGzhConfig);
```
### Common method
```javascript
const longURL = "blablbalbalablablablabla"
const shortURL = await gzh.getShortURL(longURL);
```
### Manage users
```javascript
gzh.getUserID(code);
gzh.getUser(code);
gzh.getFollower(openid);
gzh.getFollowersOpenids(quantity);
gzh.getFollowers(quantity);
```
### Manage menu
```javascript
gzh.createMenu(menu);
gzh.getMenu(menu);
gzh.deleteMenu(menu);
```
### Crypto
```javascript
gzh.decrypt(stringToDecrypt).message;
```
