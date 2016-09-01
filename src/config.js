export const jwtSecret = 'Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF';

export const wechatConfig = {
  encodingAESKey: 'zC5bDgdQObhGEAOSQT2T0fzBQ6iCYgxObD5DgKH4GrS',
  token: 'DrmqwVk',
  corpId: 'wxf81392ac6d39f547',
  corpSecret: 'cWd1SUkX8hU-sLyuGovGwvFzHcVqpXfufpomDhOtc_5hcGVUKc6wJJTb4yo3k3tJ',
  authorizeCallbackURL: 'https://api.invesmart.net/api/public/weixin/qy/id=13/callback',
};

export const wechatConfig2 = {
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
  {
    fundid: '50202303',
    service: {
      ip: '127.0.0.1',
      port: '20025',
    },
  },
];
