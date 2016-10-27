export const jwtSecret = 'Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF';

export const wechatConfig = {
  encodingAESKey: 'zC5bDgdQObhGEAOSQT2T0fzBQ6iCYgxObD5DgKH4GrS',
  token: 'GT5jrEUG8qZ4dtWrBieilrhjWVdIX9D',
  corpId: 'wxf81392ac6d39f547',
  corpSecret: 'cWd1SUkX8hU-sLyuGovGwvFzHcVqpXfufpomDhOtc_5hcGVUKc6wJJTb4yo3k3tJ',
  authorizeCallbackURL: 'https://api.invesmart.net/api/public/weixin/qy/id=13/callback',
};

export const wechatGZHConfig = {
  encodingAESKey: 'e9e4ba5a860d272f09af9073d1067c07c838c777f10',
  token: 'invesmart',
  appID: 'wxe00551fb70a33e8c',
  appSecret: '379b696be1f03df7a20d6ace90efe85b',
  authorizeCallbackURL: 'https://invesmart.cn/api/public/weixin/gzh/callback',
};

export const mongoUrl = 'mongodb://127.0.0.1:27017/smartwin';

export const funds = [
  {
    fundid: '068074',
    broker: {
      name: 'ice',
      server: {
        ip: '120.76.98.94',
        port: '20002',
      },
    },
  },
  {
    fundid: '1248',
    broker: {
      name: 'ice',
      server: {
        ip: '120.76.98.94',
        port: '20001',
      },
    },
  },
];
