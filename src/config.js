export const jwtSecret = 'Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF';

export const wechatConfig = {
  encodingAESKey: 'toaQHQrzkUsgsV68QpbwwFpaEmpf9Cm3jWoc2EBvSMl',
  token: 'WmAOTUuqIWjKkRkHZwgQ',
  corpId: 'wxf81392ac6d39f547',
  corpSecret: 'cWd1SUkX8hU-sLyuGovGwvFzHcVqpXfufpomDhOtc_5hcGVUKc6wJJTb4yo3k3tJ',
  authorizeCallbackURL: 'https://api.invesmart.net/api/public/weixin/qy/id=12/callback',
};

export const mongoUrl = 'mongodb://127.0.0.1:27017/smartwin';

export const funds = [
  {
    fundid: '068074',
    service: {
      ip: 'code.invesmart.net',
      port: '20011',
    },
  },
  {
    fundid: '1248',
    service: {
      ip: '121.40.36.116',
      port: '20029',
    },
  },
];
