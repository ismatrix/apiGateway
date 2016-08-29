# sw-broker-ice
This module let you connect to ICE broker.
## How to use

```javascript
import createIceBroker from 'sw-broker-ice';

async function main(){
  const iceBroker = createIceBroker('sender:tcp -p 20001 -h invesmart.win');

  await iceBroker.connect();

  await iceBroker.subscribe('tradingEngine', '068074');

  const account = await iceBroker.queryAccount();
  const position = await iceBroker.queryPosition('068074');
  const order = await iceBroker.queryOrder('068074');
  const done = await iceBroker.queryDone('068074');

  const order = {
  		fundid:'068074',			//基金帐号
  		exchangeid:'DCE',		//交易所代码  ["SHFE", "上海期货交易所" ], [ "CZCE", "郑州商品交易所" ], [ "DCE", "大连商品交易所" ], [ "CFFEX", "中国金融期货交易所"]
  		brokerid:'9999',		//经纪
  		instrumentid:'cs1609',	//合约
  		ordertype:'1',		//订单类型		[ "0", "市价" ], [ "1", "限价" ], [ "2", "最优价" ], [ "3", "对手方最优" ], [ "4", "市价最优5挡" ]
  		direction:'L',		//多空方向		[ "L", "买入" ], [ "S", "卖出" ]
  		offsetflag:'O',		//买卖标志		[ "O", "开仓" ], [ "C", "平仓" ]
  		hedgeflag:'0',		//套保			[ "0", "投机/非备兑" ], [ "1", "保值/备兑" ], [ "2", "套利" ]   我们只用到0
  		price:3899,			//委托价格
  		volume:1,			//委托数量
  		donetype:'0',		//成交类型		[ "0", "GFD当日有效" ], [ "1", "FOK限价全成或全撤" ], [ "2", "FAK限价立即成交剩余撤销" ], [ "3", "IOC立即成交剩余自动撤销" ]
  };
  await iceBroker.order(order);
}
main()
```
