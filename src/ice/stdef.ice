/////////////////////////////////////////////////////////////////////////
///@system 新一代交易所系统
///@company 汇海基金
///@file stdef.ice
///@description  公共的结构体定义
///@history 
///20160326	dreamyzhang		创建该文件
/////////////////////////////////////////////////////////////////////////
#ifndef __ST_DEF_ICE__
#define __ST_DEF_ICE__

// public struct define
module psd
{
	struct Ticker
	{
		long 	key;		//包含时间戳 ice中都是有符号的
		double	price;		//本次结算价
		int		volum;		//成交量
		double  turnover;	//成交额
		double bidprice1;
		double bidprice2;
		double bidprice3;
		double bidprice4;
		double bidprice5;
		double askprice1;
		double askprice2;
		double askprice3;
		double askprice4;
		double askprice5;
		int bidvolum1;
		int bidvolum2;
		int bidvolum3;
		int bidvolum4;
		int bidvolum5;
		int askvolum1;
		int askvolum2;
		int askvolum3;
		int askvolum4;
		int askvolum5;	
	};

	struct KlineItem
	{
		long		key;
		double		high;		//最高价
		double  	low;		//最低价
		double		open;		//开盘价
		double		close;		//收盘价
		int			volum;		//成交量
		double		turnover;	//成交额
	};

	//给下游的数据
	struct InstrumentStatic
	{
		string  InstrumentID;
		string 	TradingDay;				//交易日
		string	ExchangeID;				//交易所代码
		string	ExchangeInstID;			//合约在交易所的代码
		double	Price;					//最新价
		double	PreClosePrice;			//昨收盘
		double	PreOpenInterest;		//昨持仓量
		double	OpenInterest;			//持仓量
		double	ClosePrice;				//今收盘
		double	UpperLimitPrice;		//涨停板价
		double	LowerLimitPrice;		//跌停板价
		double	PreDelta;				//昨虚实度
		double	CurrDelta;				//今虚实度
		double	AveragePrice;			//当日均价
		string	ActionDay;  			//业务日期
	};

	enum KlineType{K1MINUTE, K3MINUTE, K5MINUTE, K10MINUTE, K15MINUTE, K30MINUTE, K60MINUTE, KDAY, KMONTH, KNONE};
};

#endif
