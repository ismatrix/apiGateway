import createDebug from 'debug';
import {
  fund as fundDB,
} from 'sw-mongodb-crud';

const debug = createDebug('app:config');
const logError = createDebug('app:config:error');
logError.log = console.error.bind(console);

export const jwtSecret = 'Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF';
export const jwtoken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzZhNDNjNjUyNmRjZWRjMDcwMjg4YjMiLCJ1c2VyaWQiOiJ2aWN0b3IiLCJkcHQiOlsi57O757uf6YOoIl0sImlhdCI6MTQ2NzE2NDg5Mn0.-ousXclNcnTbIDTJPJWnAkVVPErPw418TMKDqpWlZO0';

export const wechatConfig = {
  encodingAESKey: 'zC5bDgdQObhGEAOSQT2T0fzBQ6iCYgxObD5DgKH4GrS',
  token: 'GT5jrEUG8qZ4dtWrBieilrhjWVdIX9D',
  corpId: 'wxf81392ac6d39f547',
  corpSecret: 'cWd1SUkX8hU-sLyuGovGwvFzHcVqpXfufpomDhOtc_5hcGVUKc6wJJTb4yo3k3tJ',
  authorizeCallbackURL: 'https://invesmart.net/api/public/weixin/qy/id=13/callback',
};

export const wechatGZHConfig = {
  encodingAESKey: 'e9e4ba5a860d272f09af9073d1067c07c838c777f10',
  token: 'invesmart',
  appID: 'wxe00551fb70a33e8c',
  appSecret: '379b696be1f03df7a20d6ace90efe85b',
  authorizeCallbackURL: 'https://invesmart.cn/api/public/weixin/gzh/callback',
};

export const mongoUrl = 'mongodb://127.0.0.1:27017/smartwin';

export const canOrderFundIDs = ['068074', '1330', '1333', '075697'];

let fundConfigs;

fundDB
  .getList({ state: 'online' }, {})
  .then((dbFunds) => {
    try {
      debug('dbFunds %o', dbFunds.map(f => f.fundid));
      fundConfigs = dbFunds.map(dbFund => ({
        serviceName: 'smartwinFuturesFund',
        fundid: dbFund.fundid,
        server: {
          ip: 'funds.invesmart.net',
          port: '50051',
        },
        jwtoken,
      }));
    } catch (err) {
      logError('getList(): %o', err);
    }
  })
  .catch(error => logError('fundDB.getList() %o', error))
  ;

export function getFundConfigs() {
  return fundConfigs;
}

export function getCanOrderFundConfigs() {
  return fundConfigs.filter(fundConf => canOrderFundIDs.includes(fundConf.fundid));
}
