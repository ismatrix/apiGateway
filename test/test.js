import logger from 'sw-common';
import socketIOClient from 'socket.io-client';
import * as markets from '../api/markets';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Nzc2MmQ1ZGE3MDBjMGIxYjZhM2E0ZjkiLCJ1c2VyaWQiOiJ0cmlzdGFuIiwiZHB0IjpbIuezu-e7n-mDqCJdLCJpYXQiOjE2Nzc4MTMxNDB9.0bnf2vg4Mw-aF_qep7gtnMWhUBRPi_B-SHOqcekxnl0';

const socket = socketIOClient('https://quantowin.com');
// const markets = socketIOClient('http://localhost:3000/markets')
const funds = socketIOClient('https://quantowin.com');

async function main() {
  try {
    const para = {
      symbol: 'i2305',
      resolution: '5minute',
      startDate: "2023-03-20",
      endDate: "2023-03-25",
    }
    const jwtoken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Nzc2MmQ1ZGE3MDBjMGIxYjZhM2E0ZjkiLCJ1c2VyaWQiOiJ0cmlzdGFuIiwiZHB0IjpbIuezu-e7n-mDqCJdLCJpYXQiOjE2Nzc4MTMxNDB9.0bnf2vg4Mw-aF_qep7gtnMWhUBRPi_B-SHOqcekxnl0';
    const ret = await markets.getFuturesQuotes(para, jwtoken);
    // logger.debug('test main');
    // socket.on('connect', () => {
    //   socket.emit('setToken', { token }, (setTokenResult) => {
    //     if (!setTokenResult.ok) throw new Error(setTokenResult.error);
    //     logger.debug('socket.setToken() %o', setTokenResult);

    //     funds.on('liveAccount', liveAccount => logger.debug('liveAccount %o', liveAccount));
    //     funds.on('livePositions', livePositions => logger.debug('livePositions %o', livePositions));
    //     funds.on('order', order => logger.debug('order %o', order));

    //     funds.emit('subscribe', { fundid: '107765', eventName: 'livePositions' }, (result) => {
    //       if (!result.ok) throw new Error(result.error);
    //       logger.debug('funds.subscribe() %o', result);
    //     });

    //     const unsubscribe = () => {
    //       funds.emit('unsubscribe', { fundid: 'all', eventName: 'basics' }, (result) => {
    //         if (!result.ok) throw new Error(result.error);
    //         logger.debug('funds.unsubscribe() %o', result);
    //       });
    //     };
    //     // setTimeout(unsubscribe, 5000);
    //   });
    //   // const subscribe = () => {
    //   //   funds.emit('subscribe', { fundid: '068074', eventName: 'liveAccount' }, (result) => {
    //   //     if (!result.ok) throw new Error(result.error);
    //   //     logger.debug('funds.subscribe() %o', result);
    //   //   });
    //   // };
    //   // setInterval(subscribe, 5000);
    // });
  } catch (error) {
    logger.error('Error main(): %o', error);
  }
}
main();
