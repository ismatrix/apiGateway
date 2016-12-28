import createDebug from 'debug';
import socketIOClient from 'socket.io-client';

const debug = createDebug('apiGateway:test');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Nzg1ZTVhMWE3MDBjMGIxYjZhNmUxNjkiLCJ1c2VyaWQiOiJ2aWN0b3IiLCJkcHQiOlsi57O757uf6YOoIiwi5rWL6K-VIl0sImlhdCI6MTQ4MTUwODIwOX0.jsXu_STzmT0kafor7isqjRr27ns9I1m4ayQDyp6jFvE';

const socket = socketIOClient('http://localhost:3000');
// const markets = socketIOClient('http://localhost:3000/markets')
const funds = socketIOClient('http://localhost:3000/funds');

async function main() {
  try {
    debug('test main');
    socket.on('connect', () => {
      socket.emit('setToken', { token }, (setTokenResult) => {
        if (!setTokenResult.ok) throw new Error(setTokenResult.error);
        debug('socket.setToken() %o', setTokenResult);

        funds.on('liveAccount', liveAccount => debug('liveAccount %o', liveAccount));
        funds.on('livePositions', livePositions => debug('livePositions %o', livePositions));
        funds.on('order', order => debug('order %o', order));

        funds.emit('subscribe', { fundid: '068074', eventName: 'basics' }, (result) => {
          if (!result.ok) throw new Error(result.error);
          debug('funds.subscribe() %o', result);
        });

        const unsubscribe = () => {
          funds.emit('unsubscribe', { fundid: 'all', eventName: 'basics' }, (result) => {
            if (!result.ok) throw new Error(result.error);
            debug('funds.unsubscribe() %o', result);
          });
        };
        setTimeout(unsubscribe, 5000);
      });
      // const subscribe = () => {
      //   funds.emit('subscribe', { fundid: '068074', eventName: 'liveAccount' }, (result) => {
      //     if (!result.ok) throw new Error(result.error);
      //     debug('funds.subscribe() %o', result);
      //   });
      // };
      // setInterval(subscribe, 5000);

    });
  } catch (error) {
    debug('Error main(): %o', error);
  }
}
main();
