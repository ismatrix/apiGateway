import logger from 'sw-common';
import socketIOClient from 'socket.io-client';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Nzg1ZTVhMWE3MDBjMGIxYjZhNmUxNjkiLCJ1c2VyaWQiOiJ2aWN0b3IiLCJkcHQiOlsi57O757uf6YOoIiwi5rWL6K-VIl0sImlhdCI6MTQ4MTUwODIwOX0.jsXu_STzmT0kafor7isqjRr27ns9I1m4ayQDyp6jFvE';

const socket = socketIOClient('http://localhost:3000');
// const markets = socketIOClient('http://localhost:3000/markets')
const funds = socketIOClient('http://localhost:3000/funds');

async function main() {
  try {
    logger.debug('test main');
    socket.on('connect', () => {
      socket.emit('setToken', { token }, (setTokenResult) => {
        if (!setTokenResult.ok) throw new Error(setTokenResult.error);
        logger.debug('socket.setToken() %o', setTokenResult);

        funds.on('liveAccount', liveAccount => logger.debug('liveAccount %o', liveAccount));
        funds.on('livePositions', livePositions => logger.debug('livePositions %o', livePositions));
        funds.on('order', order => logger.debug('order %o', order));

        funds.emit('subscribe', { fundid: '068074', eventName: 'basics' }, (result) => {
          if (!result.ok) throw new Error(result.error);
          logger.debug('funds.subscribe() %o', result);
        });

        const unsubscribe = () => {
          funds.emit('unsubscribe', { fundid: 'all', eventName: 'basics' }, (result) => {
            if (!result.ok) throw new Error(result.error);
            logger.debug('funds.unsubscribe() %o', result);
          });
        };
        setTimeout(unsubscribe, 5000);
      });
      // const subscribe = () => {
      //   funds.emit('subscribe', { fundid: '068074', eventName: 'liveAccount' }, (result) => {
      //     if (!result.ok) throw new Error(result.error);
      //     logger.debug('funds.subscribe() %o', result);
      //   });
      // };
      // setInterval(subscribe, 5000);
    });
  } catch (error) {
    logger.error('Error main(): %o', error);
  }
}
main();
