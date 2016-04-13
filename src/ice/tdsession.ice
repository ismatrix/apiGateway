#ifndef TDSESSIONICE
#define TDSESSIONICE

#include <Glacier2/Session.ice>

module TD
{
	exception SqlException
	{
		string reason;
	};

	struct STDoneInfo
	{
		int         	doneno;            ///< 系统成交号
		string        tradeid;						///< 交易所成交号
		int      			sessionid;         ///< 会话号
		int      			privateno;         ///< 私有号
		int         	cellid;            ///< 资产单元编号
		int    				portfolioid;       ///< 投资组合编号
		string     		marketcode;        ///< 市场代码
		string      	seccode;           ///< 合约代码
		int        		batchno;           ///< 批号
		int        		orderno;           ///< 系统委托流水号
		double        doneprice;         ///< 成交价格
		double       	donevol;           ///< 成交数量
		double     		doneamount;        ///< 成交金额
		double     		fundchangeamount; ///< 资金变动数量
		double       	stockvolamount;   ///< 股份变动数量
		int           donetime;          ///< 成交时间
		int						donedate;					///< 成交日期(期货)
		double     		Margin;             ///< 保证金
		string        bs;                 ///< 买卖标记(见数据字典-买卖类型)
		string      	offsetflag;        ///< 开平标志类型(见数据字典-开平标志类型)
		string				hedgeflag;					///< 投保标记(期货)
		string      	tradetype;					///< 交易类型
	};

	struct STAccountInfo
	{
		int        cellid;             ///< 资产单元编号
		int    		 portfolioid;        ///< 投资组合编号
		int    		 accounttype;        ///< 资产单元/投资组合标志,0-资产单元,1-投资组合
		string   	 currencytype;       ///< 币种
		int        acctype;						 ///< 资金账户类型(0-储蓄类,1-证券A股类,2-期货类,3-个股期权)
		double     deposite;           ///< 资金余额
		double     available;          ///< 可取资金余额
		double     buyable;            ///< 可用资金余额
		/// 1.0.1版本 新增字段
		double     buyfrzamt;          ///< 买入冻结金额
		double     buydoneamt;         ///< 买入成交金额
		double     selldoneamt;        ///< 卖出成交金额
		/// 新增
		double     dealfrozcap;        ///< 未成交的委托冻结金额
		double     abnormalfrznamt;    ///< 异常冻结
		double     manualunfrznamt;    ///< 手动解冻资金
		double     margin;             ///< 保证金
		double     outcap;             ///< 当日划出资金
		double     incap;              ///< 当日划入资金
		double     realprofit;         ///< 实现盈亏
		double     forbidasset;        ///< 禁取资产
		double	 	 dthisbal;					 ///< 昨日余额(证券期货整合新增)
		double     manualfrznamt;			 ///< 手动冻结资金(期货)
		double     RoyaltyIn;          ///< 权利金收入
		double	   RoyaltyOut;				 ///< 权利金支出
		double     RoyaltyFrozen;			 ///< 权利金冻结
	};

	struct STPositionInfo
	{
		int         cellid;                  ///< 资产单元编号
		int    			portfolioid;             ///< 投资组合编号
		int    			accounttype;             ///< 资产单元/投资组合标志,0-资产单元,1-投资组合
		string      marketcode;              ///< 市场代码
		string      seccode;                 ///< 合约代码
		string      hedgingflag;              ///< 投机套保标志
		string      PosiDirection;            ///< 持仓多空类型(0-多仓,1-空仓)
		double      pretotalvol;            ///< 昨日持仓总量
		double      preremainvol;           ///< 昨日持仓余量
		double      totalvol;                ///< 当前总持仓
		double      availvol;                ///< 当前可用余额
		double      buyvol;                  ///< 当日买入成交数量
		double      sellvol;                 ///< 当日卖出成交数量
		double      totalcost;               ///< 持仓成本
		double      avgprice;                ///< 持仓均价
		double      commission;            		///< 手续费
		double      OpenCommission;    				///< 开仓手续费
		double      CloseCommission;     			///< 平仓手续费
		double      realizedprofit;          ///< 已实现盈亏
		double      sellfrzvol;             ///< 卖出冻结数量
		double      buydoneamt;             ///< 买入成交金额
		double      selldoneamt;            ///< 卖出成交金额
		double      etffrzvol;              ///< ETF申赎冻结数量
		double      etfrtnvol;              ///< ETF申赎成交数量
		double      sellfrzundonevol;      ///< 卖出临时冻结数量
		double      etffrzundonevol;       ///< ETF申赎临时冻结数量
		double      abnormalfrznvol;        ///< 异常冻结
		double      manualunfrznvol;        ///< 可用解冻
		double      mortgagefrozenvol;      ///< 质押入库冻结数量
		double      etfleftvol;             ///< ETF申赎优先卖出剩余数量
		double      curbuyetfleftvol;     ///< 当日买入优先申赎剩余数量
		double		  currfroz;								///< 手工冻结数量(期货)
		double		  currunfroz;							///< 手工解冻数量(期货)
		double      detffrozenvol;          ///< ETF申赎成交冻结数量
		/// 期货整合新增
		//double       stkfrozamt;            ///< 未成交的委托冻结数量，不含ETF申赎冻结
		double     	usemargin;		       			///<占用保证金
		double     	ydusemargin;		  				///<昨占用保证金
		double     	totalmargin;		  				///<总保证金
		double     	discount;		              ///<优惠数量
		double     	totalprofit;							///< 累计实现盈亏
		string     	TradeType;							 	///<交易类型
		double 			lockedvol;								///<已锁定数量
		double 			availlockvol;						///<可锁定数量
		double 			unlockedvol;							///<已解锁数量
		double 			availunlockvol;					/// <可解锁数量
		double 			coverdfrozenvol;				/// <备兑冻结数量
		double 			MarginTradeFrozenVolume;	/// <融资回购标准券冻结数量
	};

	struct CThostFtdcTradeField
	{
	///经纪公司代码
	string	BrokerID;
	///投资者代码
	string	InvestorID;
	///合约代码
	string	InstrumentID;
	///报单引用
	string	OrderRef;
	///用户代码
	string	UserID;
	///交易所代码
	string	ExchangeID;
	///成交编号
	string	TradeID;
	///买卖方向
	string	Direction;
	///报单编号
	string	OrderSysID;
	///会员代码
	string	ParticipantID;
	///客户代码
	string	ClientID;
	///交易角色
	string	TradingRole;
	///合约在交易所的代码
	string	ExchangeInstID;
	///开平标志
	string	OffsetFlag;
	///投机套保标志
	string	HedgeFlag;
	///价格
	double	Price;
	///数量
	int	Volume;
	///成交时期
	string	TradeDate;
	///成交时间
	string	TradeTime;
	///成交类型
	string	TradeType;
	///成交价来源
	string	PriceSource;
	///交易所交易员代码
	string	TraderID;
	///本地报单编号
	string	OrderLocalID;
	///结算会员编号
	string	ClearingPartID;
	///业务单元
	string	BusinessUnit;
	///序号
	int	SequenceNo;
	///交易日
	string	TradingDay;
	///结算编号
	int	SettlementID;
	///经纪公司报单编号
	int	BrokerOrderSeq;
	///成交来源
	string	TradeSource;
	};

	struct CThostFtdcTradingAccountField
	{
		///经纪公司代码
		string	BrokerID;
		///投资者帐号
		string	AccountID;
		///上次质押金额
		double	PreMortgage;
		///上次信用额度
		double	PreCredit;
		///上次存款额
		double	PreDeposit;
		///上次结算准备金
		double	PreBalance;
		///上次占用的保证金
		double	PreMargin;
		///利息基数
		double	InterestBase;
		///利息收入
		double	Interest;
		///入金金额
		double	Deposit;
		///出金金额
		double	Withdraw;
		///冻结的保证金
		double	FrozenMargin;
		///冻结的资金
		double	FrozenCash;
		///冻结的手续费
		double	FrozenCommission;
		///当前保证金总额
		double	CurrMargin;
		///资金差额
		double	CashIn;
		///手续费
		double	Commission;
		///平仓盈亏
		double	CloseProfit;
		///持仓盈亏
		double	PositionProfit;
		///期货结算准备金
		double	Balance;
		///可用资金
		double	Available;
		///可取资金
		double	WithdrawQuota;
		///基本准备金
		double	Reserve;
		///交易日
		string	TradingDay;
		///结算编号
		int	SettlementID;
		///信用额度
		double	Credit;
		///质押金额
		double	Mortgage;
		///交易所保证金
		double	ExchangeMargin;
		///投资者交割保证金
		double	DeliveryMargin;
		///交易所交割保证金
		double	ExchangeDeliveryMargin;
		///保底期货结算准备金
		double	ReserveBalance;
		///币种代码
		string	CurrencyID;
		///上次货币质入金额
		double	PreFundMortgageIn;
		///上次货币质出金额
		double	PreFundMortgageOut;
		///货币质入金额
		double	FundMortgageIn;
		///货币质出金额
		double	FundMortgageOut;
		///货币质押余额
		double	FundMortgageAvailable;
		///可质押货币金额
		double	MortgageableFund;
		///特殊产品占用保证金
		double	SpecProductMargin;
		///特殊产品冻结保证金
		double	SpecProductFrozenMargin;
		///特殊产品手续费
		double	SpecProductCommission;
		///特殊产品冻结手续费
		double	SpecProductFrozenCommission;
		///特殊产品持仓盈亏
		double	SpecProductPositionProfit;
		///特殊产品平仓盈亏
		double	SpecProductCloseProfit;
		///根据持仓盈亏算法计算的特殊产品持仓盈亏
		double	SpecProductPositionProfitByAlg;
		///特殊产品交易所保证金
		double	SpecProductExchangeMargin;
	};

	struct CThostFtdcInvestorPositionField
	{
		///合约代码
		string	InstrumentID;
		///经纪公司代码
		string	BrokerID;
		///投资者代码
		string	InvestorID;
		///持仓多空方向
		string	PosiDirection;
		///投机套保标志
		string	HedgeFlag;
		///持仓日期
		string	PositionDate;
		///上日持仓
		int	YdPosition;
		///今日持仓
		int	Position;
		///多头冻结
		int	LongFrozen;
		///空头冻结
		int	ShortFrozen;
		///开仓冻结金额
		double	LongFrozenAmount;
		///开仓冻结金额
		double	ShortFrozenAmount;
		///开仓量
		int	OpenVolume;
		///平仓量
		int	CloseVolume;
		///开仓金额
		double	OpenAmount;
		///平仓金额
		double	CloseAmount;
		///持仓成本
		double	PositionCost;
		///上次占用的保证金
		double	PreMargin;
		///占用的保证金
		double	UseMargin;
		///冻结的保证金
		double	FrozenMargin;
		///冻结的资金
		double	FrozenCash;
		///冻结的手续费
		double	FrozenCommission;
		///资金差额
		double	CashIn;
		///手续费
		double	Commission;
		///平仓盈亏
		double	CloseProfit;
		///持仓盈亏
		double	PositionProfit;
		///上次结算价
		double	PreSettlementPrice;
		///本次结算价
		double	SettlementPrice;
		///交易日
		string	TradingDay;
		///结算编号
		int	SettlementID;
		///开仓成本
		double	OpenCost;
		///交易所保证金
		double	ExchangeMargin;
		///组合成交形成的持仓
		int	CombPosition;
		///组合多头冻结
		int	CombLongFrozen;
		///组合空头冻结
		int	CombShortFrozen;
		///逐日盯市平仓盈亏
		double	CloseProfitByDate;
		///逐笔对冲平仓盈亏
		double	CloseProfitByTrade;
		///今日持仓
		int	TodayPosition;
		///保证金率
		double	MarginRateByMoney;
		///保证金率(按手数)
		double	MarginRateByVolume;
		///执行冻结
		int	StrikeFrozen;
		///执行冻结金额
		double	StrikeFrozenAmount;
		///放弃执行冻结
		int	AbandonFrozen;
	};

	sequence<string> FundSeq;

	interface TdFactory
	{

	};

	interface TdCallback
	{
		//给客户端发送string信息通知
		void notifyToClient(string msg);

		//////////////////////////////////////金仕达资管推送//////////////////////////////////////
		//金仕达资管成交信息推送
		void OnSTDoneRtn(string fundid,int requestid,STDoneInfo stdata);
		//金仕达资管资金账户变动推送
		void OnSTAccountRtn(string fundid,int requestid,STAccountInfo stdata);
		//金仕达资管仓位变动推送
		void OnSTPositionRtn(string fundid,int requestid,STPositionInfo stdata);

		//////////////////////////////////////CTP推送//////////////////////////////////////
		//CTP成交信息推送
		void OnCTPDoneRtn(string fundid,int requestid,CThostFtdcTradeField ctpdata);
		//CTP资金账户变动推送
		void OnCTPAccountRtn(string fundid,int requestid,CThostFtdcTradingAccountField ctpdata);
		//CTP仓位变动推送
		void OnCTPPositionRtn(string fundid,int requestid,CThostFtdcInvestorPositionField ctpdata);

		void forceLogout();
	};

	interface TdSession extends Glacier2::Session
	{
		void setCallback(TdCallback* cb);
		//客户端订阅基金变动推送信息
		int SubscribeTd(string mid,FundSeq fundids);
		//////////////////////////////////////金仕达资管服务上报//////////////////////////////////////
		//金仕达资管成交信息上报
		void STDoneRtn(string fundid,int requestid,STDoneInfo stdata);
		//金仕达资管资金账户变动上报
		void STAccountRtn(string fundid,int requestid,STAccountInfo stdata);
		//金仕达资管仓位变动上报
		void STPositionRtn(string fundid,int requestid,STPositionInfo stdata);

		//////////////////////////////////////CTP服务上报//////////////////////////////////////
		//CTP成交信息上报
		void CTPDoneRtn(string fundid,int requestid,CThostFtdcTradeField ctpdata);
		//CTP资金账户变动上报
		void CTPAccountRtn(string fundid,int requestid,CThostFtdcTradingAccountField ctpdata);
		//CTP仓位变动上报
		void CTPPositionRtn(string fundid,int requestid,CThostFtdcInvestorPositionField ctpdata);
	};

};

#endif
