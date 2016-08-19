# sw-datafeed-icepast
This module let you create a market data feed from icePast.
## How to use

```javascript
async function init() {
  this.subscribe(
    ['IF1608'],
    {
      provider: 'icePast',
      startDate: '2016-08-01',
      endDate: '2016-08-01',
      resolution: 'minute',
    });
}
```
