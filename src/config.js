let fundConfigs;

const productionConfig = {
  jwtSecret: 'Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF',
  jwtoken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzZhNDNjNjUyNmRjZWRjMDcwMjg4YjMiLCJ1c2VyaWQiOiJ2aWN0b3IiLCJkcHQiOlsi57O757uf6YOoIl0sImlhdCI6MTQ2NzE2NDg5Mn0.-ousXclNcnTbIDTJPJWnAkVVPErPw418TMKDqpWlZO0',
  mongodbURL: 'mongodb://127.0.0.1:27017/smartwin',
  wechatConfig: {
    encodingAESKey: 'zC5bDgdQObhGEAOSQT2T0fzBQ6iCYgxObD5DgKH4GrS',
    token: 'GT5jrEUG8qZ4dtWrBieilrhjWVdIX9D',
    corpId: 'wxf81392ac6d39f547',
    corpSecret: 'cWd1SUkX8hU-sLyuGovGwvFzHcVqpXfufpomDhOtc_5hcGVUKc6wJJTb4yo3k3tJ',
    authorizeCallbackURL: 'https://invesmart.net/api/public/weixin/qy/id=13/callback',
  },
  wechatGZHConfig: {
    encodingAESKey: 'e9e4ba5a860d272f09af9073d1067c07c838c777f10',
    token: 'invesmart',
    appID: 'wxe00551fb70a33e8c',
    appSecret: '379b696be1f03df7a20d6ace90efe85b',
    authorizeCallbackURL: 'https://invesmart.cn/api/public/weixin/gzh/callback',
  },
  fundConfigs,
};

const developmentConfig = Object.assign({},
  productionConfig,
  {
    mongodbURL: 'mongodb://127.0.0.1:27018/smartwin',
  }
);

const config = process.env.NODE_ENV === 'development' ? developmentConfig : productionConfig;

export default config;
