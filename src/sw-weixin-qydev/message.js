const debug = require('debug')('sw-weixin-qydev:message');
import fetch from 'node-fetch';
import Boom from 'boom';

async function sendMessage(message) {
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

async function send() {
  try {
    const accessToken = await this.getAccessToken();
    const url = `${this.prefix}message/send?access_token=${accessToken}`;
    debug('send() message %o', this.body);
    const sendMessageRes = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.body),
    }).then(res => res.json());
    debug('send() sendMessageRes: %o', sendMessageRes);

    if (sendMessageRes.errcode !== 0) throw Boom.notFound('qydev message api errcode not null');
  } catch (error) {
    debug(`send() error: ${error}`);
    throw error;
  }
}

function to(user) {
  try {
    debug('user %o', user);
    const users = [].concat(user);
    if (!this.body.touser) {
      this.body.touser = users.join('|');
    } else {
      this.body.touser = this.body.touser.concat('|', users.join('|'));
    }
    return this;
  } catch (error) {
    debug(`to() error: ${error}`);
    throw error;
  }
}

function toGroup(group) {
  try {
    const groups = [].concat(group);
    if (!this.body.toparty) {
      this.body.toparty = groups.join('|');
    } else {
      this.body.toparty = this.body.toparty.concat('|', groups.join('|'));
    }
    return this;
  } catch (error) {
    debug(`toGroup() error: ${error}`);
    throw error;
  }
}

function toTag(tag) {
  try {
    const tags = [].concat(tag);
    if (!this.body.totag) {
      this.body.totag = tags.join('|');
    } else {
      this.body.totag = this.body.totag.concat('|', tags.join('|'));
    }
    return this;
  } catch (error) {
    debug(`toTag() error: ${error}`);
    throw error;
  }
}

function createMessage() {
  try {
    const message = {};
    message.body = {
      agentid: 12,
      safe: 0,
    };
    const messageObject = Object.assign(
      Object.create(this),
      message,
      { to, toGroup, toTag },
    );
    return messageObject;
  } catch (error) {
    debug(`createMessage() error: ${error}`);
    throw error;
  }
}

function text(userMessage) {
  try {
    const message = this.createMessage();
    message.body.text = { content: userMessage };
    message.body.msgtype = 'text';
    return message;
  } catch (error) {
    debug(`text() error: ${error}`);
    throw error;
  }
}

const message = {
  sendMessage,
  send,
  createMessage,
  text,
};
export default message;
