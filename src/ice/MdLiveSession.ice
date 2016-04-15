#ifndef		__SUBCRIBRMd_ICE__
#define		__SUBCRIBRMd_ICE__

#include <Glacier2/Session.ice>
#include <stdef.ice>


module MdLive
{
	interface MdSessionCallBack
	{
		int  InstrumentStatic(psd::InstrumentStatic ins);           //静态数据给客户端
		int  TickerItem(string InstrumentID, psd::Ticker ticker);   //ticker数据
		int  KlineItem(string InstrumentID, psd::KlineItem kline, psd::KlineType type); //kline数据
		int  NotifySub(int ret, string msg);											//通知客户端需要订阅
	};
	
	//支持Glacier2的session 
	interface MdSession extends Glacier2::Session
	{
		int setCallBack(MdSessionCallBack* cb);				//设置回调
		void   refresh();	//客户端调用心跳
		
		//type = A K T 
		int subscribeMd(string insid, string type, int num);	 //订阅同时记录下这条连接
		int unSubscribeMd(string insid, string type, int num); //退订并删除这条连接信息
	
		//server debug tools
		string  QuerySession();				//查询server端的所有session
		string  QuerySubCurrent();			//查询server端当前订阅
		string  QueryTicker(string insid);	//查询server内存中ticker
		string  QueryKline(string insid);	//查询server内存中的Kline数据
		string  QuerySnap(string insid);	//查询所有的快照信息
	};
};

#endif




