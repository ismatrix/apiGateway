/////////////////////////////////////////////////////////////////////////
///@system 交易系统
///@company 慧网基金
///@file stdef.ice
///@description  交易公共结构定义
///@history
///20160326    dreamyzhang        创建该文件
/////////////////////////////////////////////////////////////////////////
#ifndef __COMMON_ICE__
#define __COMMON_ICE__

module CM
{
	////////////////////////////////////行情 start//////////////////////////////////////////////////////////////
	struct Ticker
	{
		long		Timestamp;			//ACTIONDAY+HH24MISS+.SSS;
		double		Price;				//本次结算价
		int			Volume;				//成交量
		double		Turnover;			//成交额
		double		OpenInterest;		//持仓量 未平仓合约
		double		TotalVolume;		//成交量
		double		TotalTurnover;		//成交额
		double		BidPrice1;			//买一价
		double		AskPrice1;			//卖一价
		int			BidVolume1;			//买一量
		int			AskVolume1;			//卖一量
	};

	struct Bar
	{
		long		Timestamp;			//ActionDay+hh24mi00.000(1461202201 000 == 2016-04-21 09:30:01 000)
		double		High;				//最高价
		double		Low;				//最低价
		double		Open;				//开盘价
		double		Close;				//收盘价
		int			Volume;				//成交量
		double		Turnover;			//成交额
		double		OpenInterest;		//持仓量 未平仓合约
	};

	struct DayBar
	{
		long		Timestamp;			//TradeDay+hh24mi00(1461168000 == 2016-04-21 00:00:00)
		double		High;				//最高价
		double		Low;				//最低价
		double		Open;				//开盘价
		double		Close;				//收盘价
		double		Average;			//日均价
		int			Volume;				//成交量
		double		Turnover;			//成交额
		double		Settlement;			//结算价
		double		OpenInterest;		//持仓量 未平仓合约
		double		PreSettlement;		//上次结算价
		double		PreClose;			//昨收盘
		double		PreoOpenInterest;	//昨持仓量
	};
	////////////////////////////////////行情 end//////////////////////////////////////////////////////////////

};

#endif
