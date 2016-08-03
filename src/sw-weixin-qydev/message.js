const debug = require('debug')('sw-weixin-qydev:message');
import fetch from 'node-fetch';
import Boom from 'boom';

// {
//    "touser": "UserID1|UserID2|UserID3",
//    "toparty": " PartyID1 | PartyID2 ",
//    "totag": " TagID1 | TagID2 ",
//    "msgtype": "text",
//    "agentid": 1,
//    "text": {
//        "content": "Holiday Request For Pony(http://xxxxx)"
//    },
//    "safe":"0"
// }

export async function sendMessage(message) {
  try {
    const accessToken = await this.getAccessToken();
    const url = `${this.prefix}message/send?access_token=${accessToken}`;
    debug('url %o', url);
    debug('message %o', message);
    debug('JSON.stringify(message) %o', JSON.stringify(message));
    const sendMessageRes = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    }).then(res => res.json());
    debug('sendMessage() sendMessageRes: %o', sendMessageRes);

    if (sendMessageRes.errcode !== 0) throw Boom.notFound('qydev message api errcode not null');
  } catch (error) {
    debug(`sendMessage() error: ${error}`);
    throw error;
  }
}

const message = {
  sendMessage,
};
export default message;
