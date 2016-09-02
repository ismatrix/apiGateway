# sw-datafeed-icelive
This module let you create a market data feed from iceLive.
## How to use

```javascript
async function init() {
  this.subscribe(
    ['IF1608'],
    {
      provider: 'iceLive',
      resolution: 'tick',
    });
  this.subscribe(
    ['IF1608'],
    {
      provider: 'iceLive',
      resolution: 'minute',
    });
}
```
