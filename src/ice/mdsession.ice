#ifndef MD_SESSION_ICE
#define MD_SESSION_ICE

#include <Glacier2/Session.ice>

module MD
{
	exception SqlException
	{
		string reason;
	};

	struct TickData
	{
		string InstrumentId;     	///合约代码
		string TradingDay;				///交易日
		string UpdateTime;				///最后修改时间
		int UpdateMillisec;				///最后修改毫秒
		double LastPrice;					///最新价
		double OpenPrice;					///今开盘
		double HighestPrice;			///最高价
		double LowestPrice;   		///最低价
		double ClosePrice;   			///今收盘
		double SettlementPrice;		///本次结算价
		int Volume;								///数量
		double Turnover;					///成交金额
		double OpenInterest;			///持仓量
		double UpperLimitPrice;		///涨停板价
		double LowerLimitPrice;		///跌停板价
		///申买
		double BidPrice1;
		int BidVolume1;
		double BidPrice2;
		int BidVolume2;
		double BidPrice3;
		int BidVolume3;
		double BidPrice4;
		int BidVolume4;
		double BidPrice5;
		int BidVolume5;
		///申卖
		double AskPrice1;
		int AskVolume1;
		double AskPrice2;
		int AskVolume2;
		double AskPrice3;
		int AskVolume3;
		double AskPrice4;
		int AskVolume4;
		double AskPrice5;
		int AskVolume5;
	};

	interface MdFactory
	{
		//订阅实时行情
		int SubscribeMarketData(string InstrumentID);
		//退订实时行情
		int UnSubscribeMarketData(string InstrumentID);
	};

	sequence<string> InstrumentsSeq;

	interface MdCallback
	{
		void notifyToClient(string msg);
		void OnTick(TickData td);
		void forceLogout();
	};

	interface MdSession extends Glacier2::Session
	{
		void setCallback(MdCallback* cb);
		int say(string msg);
		int SubscribeMd(string mid,string level ,InstrumentsSeq ins);
	};

};

#endif
