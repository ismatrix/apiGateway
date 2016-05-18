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
		long		Timestamp;
		double		Price;
		int			Volume;
		double		Turnover;
		double		OpenInterest;
		double		TotalVolume;
		double		TotalTurnover;
		double		BidPrice1;
		double		AskPrice1;
		int			BidVolume1;
		int			AskVolume1;
	};

	struct Bar
	{
		long		Timestamp;
		double		High;
		double		Low;
		double		Open;
		double		Close;
		int			Volume;
		double		Turnover;
	};

	struct DayBar
	{
		long		Timestamp;
		double		High;
		double		Low;
		double		Open;
		double		Close;
		double		Average;
		int			Volume;
		double		Turnover;
		double		Settlement;
		double		PreSettlement;
		double		PreClose;
		double		PreoOpenInterest;
	};
};

#endif
