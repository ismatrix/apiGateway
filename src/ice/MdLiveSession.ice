#ifndef		__SUBCRIBRMd_ICE__
#define		__SUBCRIBRMd_ICE__

#include <Glacier2/Session.ice>
#include <stdef.ice>


module MdLive
{
	interface MdSessionCallBack
	{
		/*
		* onTick 		: 每次收到tick数据触发，推送给订阅的客户端
		* TradingDay 	: 交易日
		* InstrumentID 	: 合约名
		* Ticker		: 一条ticker数据
		* Return 		: 返回值0
		*/
		int  onTick(string TradingDay,string InstrumentID, psd::Ticker ticker);

		/*
		* onBar 		: 分k收盘触发 推送给订阅的客户端
		* TradingDay 	: 交易日
		* InstrumentID 	: 合约名
		* bar			: 分k数据
		* Return		: 返回值0
		*/
		int  onBar(string TradingDay,string InstrumentID , psd::Bar bar );

		/*
		* onDay 		: 日k收盘触发 推送给订阅的客户端
		* TradingDay 	: 交易日
		* InstrumentID 	: 合约名
		* day			: 日k数据
		* Return		: 返回值0
		*/
		int  onDay(string TradingDay,string InstrumentID , psd::DayBar day );
	};


	//支持Glacier2的session
	interface MdSession extends Glacier2::Session
	{
		/*
		* setCallBack: 注册客户端
		* cb		: 回调函数句柄
		* Return	: 返回值0成功
		*/
		int setCallBack(MdSessionCallBack* cb);				//设置回调

		/*
		* heartBeat	: 心跳 维持长连接
		*/
		void   heartBeat();	//客户端调用心跳

		/*
		* subscribeMd: 订阅
		* insid		: 合约名
		* level		: T/M  ticker或者分k
		* return	: 0成功
		* example	: subscribeMd('IF1601','T'); / subscribeMd('IF1601','M');
		*/
		int subscribeMd(string insid, string level);

		/*
		* unSubscribeMd: 退订
		* insid		: 合约名
		* level		: T/M  ticker或者分k
		* return	: 0成功
		* example	: unSubscribeMd('IF1601','T'); / unSubscribeMd('IF1601','M');
		*/
		int unSubscribeMd(string insid, string level);


		//server debug tools
		string  QuerySession();				//查询server端的所有session
		string  QuerySubCurrent();			//查询server端当前订阅
		string  QueryTicker(string insid);	//查询server内存中ticker
		string  QueryKline(string insid);	//查询server内存中的Kline数据
		string  QuerySnap(string insid);	//查询所有的快照信息
	};
};

#endif
