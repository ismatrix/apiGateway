import socketIOClient from 'socket.io-client';
import logger from 'sw-common';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Nzg1ZTVhMWE3MDBjMGIxYjZhNmUxNjkiLCJ1c2VyaWQiOiJ2aWN0b3IiLCJkcHQiOlsi57O757uf6YOoIiwi5rWL6K-VIl0sImlhdCI6MTQ4MTUwODIwOX0.jsXu_STzmT0kafor7isqjRr27ns9I1m4ayQDyp6jFvE';

const socket = socketIOClient('http://localhost:3000');
// const markets = socketIOClient('http://localhost:3000/markets')
const funds = socketIOClient('http://localhost:3000/funds');

async function main() {
  try {
    logger.info('test main');
    socket.on('connect', () => {
      socket.emit('setToken', { token }, (setTokenResult) => {
        if (!setTokenResult.ok) throw new Error(setTokenResult.error);
        logger.info('socket.setToken() %j', setTokenResult);

        funds.on('liveAccount', liveAccount => logger.info('liveAccount %j', liveAccount));
        funds.on('livePositions', livePositions => logger.info('livePositions %j', livePositions));
        funds.on('order', order => logger.info('order %j', order));

        funds.emit('subscribe', { fundid: '068074', eventName: 'basics' }, (result) => {
          if (!result.ok) throw new Error(result.error);
          logger.info('funds.subscribe() %j', result);
        });

        const unsubscribe = () => {
          funds.emit('unsubscribe', { fundid: 'all', eventName: 'basics' }, (result) => {
            if (!result.ok) throw new Error(result.error);
            logger.info('funds.unsubscribe() %j', result);
          });
        };
        setTimeout(unsubscribe, 5000);
      });
      // const subscribe = () => {
      //   funds.emit('subscribe', { fundid: '068074', eventName: 'liveAccount' }, (result) => {
      //     if (!result.ok) throw new Error(result.error);
      //     logger.info('funds.subscribe() %j', result);
      //   });
      // };
      // setInterval(subscribe, 5000);

    });
  } catch (error) {
    logger.info('Error main(): %j', error);
  }
}
main();
