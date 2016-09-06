# sw-broker-ice
This module let you interact with wechat 企业号 API. (http://qydev.weixin.qq.com/wiki)
## How to use
### config.js
```javascript
export const wechatConfig = {
  encodingAESKey: 'myAESKey',
  token: 'myToken',
  corpId: 'corpId',
  corpSecret: 'myCorpSecret',
  authorizeCallbackURL: 'myCbUrl',
};
```
### initialize
```javascript
import createQydev from 'sw-weixin-qydev';
import { wechatConfig } from '../config';
const qydev = createQydev(wechatConfig);
```
### Send Messages
```javascript
qydev.text('this is a text message to a user').to('Victor').send();
qydev.text('this is a text message to a group').toGroup('系统部').send();
qydev.text('this is a text message to a group').toTag('myTag').send();
```
### Manage users
```javascript
qydev.getUser(code);
qydev.getUserWithDepartments(code);
```
### Crypto
```javascript
qydev.decrypt(stringToDecrypt).message;
```
