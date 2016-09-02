// **********************************************************************
//
// Copyright (c) 2003-2016 ZeroC, Inc. All rights reserved.
//
// This copy of Ice is licensed to you under the terms described in the
// ICE_LICENSE file included in this distribution.
//
// **********************************************************************
//
// Ice version 3.6.2
//
// <auto-generated>
//
// Generated from file `Common.ice'
//
// Warning: do not edit this file.
//
// </auto-generated>
//

(function(module, require, exports)
{
    var Ice = require("ice").Ice;
    var __M = Ice.__M;
    var Slice = Ice.Slice;

    var CM = __M.module("CM");

    CM.Ticker = Slice.defineStruct(
        function(Timestamp, Price, Volume, Turnover, OpenInterest, TotalVolume, TotalTurnover, BidPrice1, AskPrice1, BidVolume1, AskVolume1)
        {
            this.Timestamp = Timestamp !== undefined ? Timestamp : 0;
            this.Price = Price !== undefined ? Price : 0.0;
            this.Volume = Volume !== undefined ? Volume : 0;
            this.Turnover = Turnover !== undefined ? Turnover : 0.0;
            this.OpenInterest = OpenInterest !== undefined ? OpenInterest : 0.0;
            this.TotalVolume = TotalVolume !== undefined ? TotalVolume : 0.0;
            this.TotalTurnover = TotalTurnover !== undefined ? TotalTurnover : 0.0;
            this.BidPrice1 = BidPrice1 !== undefined ? BidPrice1 : 0.0;
            this.AskPrice1 = AskPrice1 !== undefined ? AskPrice1 : 0.0;
            this.BidVolume1 = BidVolume1 !== undefined ? BidVolume1 : 0;
            this.AskVolume1 = AskVolume1 !== undefined ? AskVolume1 : 0;
        },
        false,
        function(__os)
        {
            __os.writeLong(this.Timestamp);
            __os.writeDouble(this.Price);
            __os.writeInt(this.Volume);
            __os.writeDouble(this.Turnover);
            __os.writeDouble(this.OpenInterest);
            __os.writeDouble(this.TotalVolume);
            __os.writeDouble(this.TotalTurnover);
            __os.writeDouble(this.BidPrice1);
            __os.writeDouble(this.AskPrice1);
            __os.writeInt(this.BidVolume1);
            __os.writeInt(this.AskVolume1);
        },
        function(__is)
        {
            this.Timestamp = __is.readLong();
            this.Price = __is.readDouble();
            this.Volume = __is.readInt();
            this.Turnover = __is.readDouble();
            this.OpenInterest = __is.readDouble();
            this.TotalVolume = __is.readDouble();
            this.TotalTurnover = __is.readDouble();
            this.BidPrice1 = __is.readDouble();
            this.AskPrice1 = __is.readDouble();
            this.BidVolume1 = __is.readInt();
            this.AskVolume1 = __is.readInt();
        },
        76, 
        true);

    CM.Bar = Slice.defineStruct(
        function(Timestamp, High, Low, Open, Close, Volume, Turnover, OpenInterest)
        {
            this.Timestamp = Timestamp !== undefined ? Timestamp : 0;
            this.High = High !== undefined ? High : 0.0;
            this.Low = Low !== undefined ? Low : 0.0;
            this.Open = Open !== undefined ? Open : 0.0;
            this.Close = Close !== undefined ? Close : 0.0;
            this.Volume = Volume !== undefined ? Volume : 0;
            this.Turnover = Turnover !== undefined ? Turnover : 0.0;
            this.OpenInterest = OpenInterest !== undefined ? OpenInterest : 0.0;
        },
        false,
        function(__os)
        {
            __os.writeLong(this.Timestamp);
            __os.writeDouble(this.High);
            __os.writeDouble(this.Low);
            __os.writeDouble(this.Open);
            __os.writeDouble(this.Close);
            __os.writeInt(this.Volume);
            __os.writeDouble(this.Turnover);
            __os.writeDouble(this.OpenInterest);
        },
        function(__is)
        {
            this.Timestamp = __is.readLong();
            this.High = __is.readDouble();
            this.Low = __is.readDouble();
            this.Open = __is.readDouble();
            this.Close = __is.readDouble();
            this.Volume = __is.readInt();
            this.Turnover = __is.readDouble();
            this.OpenInterest = __is.readDouble();
        },
        60, 
        true);

    CM.DayBar = Slice.defineStruct(
        function(Timestamp, High, Low, Open, Close, Average, Volume, Turnover, Settlement, OpenInterest, PreSettlement, PreClose, PreoOpenInterest, Price, UpperLimit, LowerLimit)
        {
            this.Timestamp = Timestamp !== undefined ? Timestamp : 0;
            this.High = High !== undefined ? High : 0.0;
            this.Low = Low !== undefined ? Low : 0.0;
            this.Open = Open !== undefined ? Open : 0.0;
            this.Close = Close !== undefined ? Close : 0.0;
            this.Average = Average !== undefined ? Average : 0.0;
            this.Volume = Volume !== undefined ? Volume : 0;
            this.Turnover = Turnover !== undefined ? Turnover : 0.0;
            this.Settlement = Settlement !== undefined ? Settlement : 0.0;
            this.OpenInterest = OpenInterest !== undefined ? OpenInterest : 0.0;
            this.PreSettlement = PreSettlement !== undefined ? PreSettlement : 0.0;
            this.PreClose = PreClose !== undefined ? PreClose : 0.0;
            this.PreoOpenInterest = PreoOpenInterest !== undefined ? PreoOpenInterest : 0.0;
            this.Price = Price !== undefined ? Price : 0.0;
            this.UpperLimit = UpperLimit !== undefined ? UpperLimit : 0.0;
            this.LowerLimit = LowerLimit !== undefined ? LowerLimit : 0.0;
        },
        false,
        function(__os)
        {
            __os.writeLong(this.Timestamp);
            __os.writeDouble(this.High);
            __os.writeDouble(this.Low);
            __os.writeDouble(this.Open);
            __os.writeDouble(this.Close);
            __os.writeDouble(this.Average);
            __os.writeInt(this.Volume);
            __os.writeDouble(this.Turnover);
            __os.writeDouble(this.Settlement);
            __os.writeDouble(this.OpenInterest);
            __os.writeDouble(this.PreSettlement);
            __os.writeDouble(this.PreClose);
            __os.writeDouble(this.PreoOpenInterest);
            __os.writeDouble(this.Price);
            __os.writeDouble(this.UpperLimit);
            __os.writeDouble(this.LowerLimit);
        },
        function(__is)
        {
            this.Timestamp = __is.readLong();
            this.High = __is.readDouble();
            this.Low = __is.readDouble();
            this.Open = __is.readDouble();
            this.Close = __is.readDouble();
            this.Average = __is.readDouble();
            this.Volume = __is.readInt();
            this.Turnover = __is.readDouble();
            this.Settlement = __is.readDouble();
            this.OpenInterest = __is.readDouble();
            this.PreSettlement = __is.readDouble();
            this.PreClose = __is.readDouble();
            this.PreoOpenInterest = __is.readDouble();
            this.Price = __is.readDouble();
            this.UpperLimit = __is.readDouble();
            this.LowerLimit = __is.readDouble();
        },
        124, 
        true);

    CM.Done = Slice.defineStruct(
        function(tradingday, fundid, requestid, brokerid, orderid, tradeid, exchangeid, instrumentid, direction, offsetflag, hedgeflag, price, volume, tradedate, tradetime, updatedate)
        {
            this.tradingday = tradingday !== undefined ? tradingday : "";
            this.fundid = fundid !== undefined ? fundid : "";
            this.requestid = requestid !== undefined ? requestid : "";
            this.brokerid = brokerid !== undefined ? brokerid : "";
            this.orderid = orderid !== undefined ? orderid : "";
            this.tradeid = tradeid !== undefined ? tradeid : "";
            this.exchangeid = exchangeid !== undefined ? exchangeid : "";
            this.instrumentid = instrumentid !== undefined ? instrumentid : "";
            this.direction = direction !== undefined ? direction : "";
            this.offsetflag = offsetflag !== undefined ? offsetflag : "";
            this.hedgeflag = hedgeflag !== undefined ? hedgeflag : "";
            this.price = price !== undefined ? price : 0.0;
            this.volume = volume !== undefined ? volume : 0;
            this.tradedate = tradedate !== undefined ? tradedate : "";
            this.tradetime = tradetime !== undefined ? tradetime : "";
            this.updatedate = updatedate !== undefined ? updatedate : "";
        },
        false,
        function(__os)
        {
            __os.writeString(this.tradingday);
            __os.writeString(this.fundid);
            __os.writeString(this.requestid);
            __os.writeString(this.brokerid);
            __os.writeString(this.orderid);
            __os.writeString(this.tradeid);
            __os.writeString(this.exchangeid);
            __os.writeString(this.instrumentid);
            __os.writeString(this.direction);
            __os.writeString(this.offsetflag);
            __os.writeString(this.hedgeflag);
            __os.writeDouble(this.price);
            __os.writeInt(this.volume);
            __os.writeString(this.tradedate);
            __os.writeString(this.tradetime);
            __os.writeString(this.updatedate);
        },
        function(__is)
        {
            this.tradingday = __is.readString();
            this.fundid = __is.readString();
            this.requestid = __is.readString();
            this.brokerid = __is.readString();
            this.orderid = __is.readString();
            this.tradeid = __is.readString();
            this.exchangeid = __is.readString();
            this.instrumentid = __is.readString();
            this.direction = __is.readString();
            this.offsetflag = __is.readString();
            this.hedgeflag = __is.readString();
            this.price = __is.readDouble();
            this.volume = __is.readInt();
            this.tradedate = __is.readString();
            this.tradetime = __is.readString();
            this.updatedate = __is.readString();
        },
        26, 
        false);

    CM.Account = Slice.defineStruct(
        function(tradingday, fundid, brokerid, prebalance, premargin, requestid, tradeid, balance, available, margin, incap, outcap, opencommission, closecommission, closeprofit, positionprofit, totalprofile, updatedate)
        {
            this.tradingday = tradingday !== undefined ? tradingday : "";
            this.fundid = fundid !== undefined ? fundid : "";
            this.brokerid = brokerid !== undefined ? brokerid : "";
            this.prebalance = prebalance !== undefined ? prebalance : 0.0;
            this.premargin = premargin !== undefined ? premargin : 0.0;
            this.requestid = requestid !== undefined ? requestid : "";
            this.tradeid = tradeid !== undefined ? tradeid : "";
            this.balance = balance !== undefined ? balance : 0.0;
            this.available = available !== undefined ? available : 0.0;
            this.margin = margin !== undefined ? margin : 0.0;
            this.incap = incap !== undefined ? incap : 0.0;
            this.outcap = outcap !== undefined ? outcap : 0.0;
            this.opencommission = opencommission !== undefined ? opencommission : 0.0;
            this.closecommission = closecommission !== undefined ? closecommission : 0.0;
            this.closeprofit = closeprofit !== undefined ? closeprofit : 0.0;
            this.positionprofit = positionprofit !== undefined ? positionprofit : 0.0;
            this.totalprofile = totalprofile !== undefined ? totalprofile : 0.0;
            this.updatedate = updatedate !== undefined ? updatedate : "";
        },
        false,
        function(__os)
        {
            __os.writeString(this.tradingday);
            __os.writeString(this.fundid);
            __os.writeString(this.brokerid);
            __os.writeDouble(this.prebalance);
            __os.writeDouble(this.premargin);
            __os.writeString(this.requestid);
            __os.writeString(this.tradeid);
            __os.writeDouble(this.balance);
            __os.writeDouble(this.available);
            __os.writeDouble(this.margin);
            __os.writeDouble(this.incap);
            __os.writeDouble(this.outcap);
            __os.writeDouble(this.opencommission);
            __os.writeDouble(this.closecommission);
            __os.writeDouble(this.closeprofit);
            __os.writeDouble(this.positionprofit);
            __os.writeDouble(this.totalprofile);
            __os.writeString(this.updatedate);
        },
        function(__is)
        {
            this.tradingday = __is.readString();
            this.fundid = __is.readString();
            this.brokerid = __is.readString();
            this.prebalance = __is.readDouble();
            this.premargin = __is.readDouble();
            this.requestid = __is.readString();
            this.tradeid = __is.readString();
            this.balance = __is.readDouble();
            this.available = __is.readDouble();
            this.margin = __is.readDouble();
            this.incap = __is.readDouble();
            this.outcap = __is.readDouble();
            this.opencommission = __is.readDouble();
            this.closecommission = __is.readDouble();
            this.closeprofit = __is.readDouble();
            this.positionprofit = __is.readDouble();
            this.totalprofile = __is.readDouble();
            this.updatedate = __is.readString();
        },
        102, 
        false);

    CM.Position = Slice.defineStruct(
        function(tradingday, fundid, brokerid, requestid, tradeid, instrumentid, direction, hedgeflag, preposition, preholdposition, position, openvolume, closevolume, openamount, closeamount, opencost, positioncost, premargin, margin, opencommission, closecommission, closeprofit, positionprofit, totalprofile, updatedate)
        {
            this.tradingday = tradingday !== undefined ? tradingday : "";
            this.fundid = fundid !== undefined ? fundid : "";
            this.brokerid = brokerid !== undefined ? brokerid : "";
            this.requestid = requestid !== undefined ? requestid : "";
            this.tradeid = tradeid !== undefined ? tradeid : "";
            this.instrumentid = instrumentid !== undefined ? instrumentid : "";
            this.direction = direction !== undefined ? direction : "";
            this.hedgeflag = hedgeflag !== undefined ? hedgeflag : "";
            this.preposition = preposition !== undefined ? preposition : 0;
            this.preholdposition = preholdposition !== undefined ? preholdposition : 0;
            this.position = position !== undefined ? position : 0;
            this.openvolume = openvolume !== undefined ? openvolume : 0;
            this.closevolume = closevolume !== undefined ? closevolume : 0;
            this.openamount = openamount !== undefined ? openamount : 0.0;
            this.closeamount = closeamount !== undefined ? closeamount : 0.0;
            this.opencost = opencost !== undefined ? opencost : 0.0;
            this.positioncost = positioncost !== undefined ? positioncost : 0.0;
            this.premargin = premargin !== undefined ? premargin : 0.0;
            this.margin = margin !== undefined ? margin : 0.0;
            this.opencommission = opencommission !== undefined ? opencommission : 0.0;
            this.closecommission = closecommission !== undefined ? closecommission : 0.0;
            this.closeprofit = closeprofit !== undefined ? closeprofit : 0.0;
            this.positionprofit = positionprofit !== undefined ? positionprofit : 0.0;
            this.totalprofile = totalprofile !== undefined ? totalprofile : 0.0;
            this.updatedate = updatedate !== undefined ? updatedate : "";
        },
        false,
        function(__os)
        {
            __os.writeString(this.tradingday);
            __os.writeString(this.fundid);
            __os.writeString(this.brokerid);
            __os.writeString(this.requestid);
            __os.writeString(this.tradeid);
            __os.writeString(this.instrumentid);
            __os.writeString(this.direction);
            __os.writeString(this.hedgeflag);
            __os.writeInt(this.preposition);
            __os.writeInt(this.preholdposition);
            __os.writeInt(this.position);
            __os.writeInt(this.openvolume);
            __os.writeInt(this.closevolume);
            __os.writeDouble(this.openamount);
            __os.writeDouble(this.closeamount);
            __os.writeDouble(this.opencost);
            __os.writeDouble(this.positioncost);
            __os.writeDouble(this.premargin);
            __os.writeDouble(this.margin);
            __os.writeDouble(this.opencommission);
            __os.writeDouble(this.closecommission);
            __os.writeDouble(this.closeprofit);
            __os.writeDouble(this.positionprofit);
            __os.writeDouble(this.totalprofile);
            __os.writeString(this.updatedate);
        },
        function(__is)
        {
            this.tradingday = __is.readString();
            this.fundid = __is.readString();
            this.brokerid = __is.readString();
            this.requestid = __is.readString();
            this.tradeid = __is.readString();
            this.instrumentid = __is.readString();
            this.direction = __is.readString();
            this.hedgeflag = __is.readString();
            this.preposition = __is.readInt();
            this.preholdposition = __is.readInt();
            this.position = __is.readInt();
            this.openvolume = __is.readInt();
            this.closevolume = __is.readInt();
            this.openamount = __is.readDouble();
            this.closeamount = __is.readDouble();
            this.opencost = __is.readDouble();
            this.positioncost = __is.readDouble();
            this.premargin = __is.readDouble();
            this.margin = __is.readDouble();
            this.opencommission = __is.readDouble();
            this.closecommission = __is.readDouble();
            this.closeprofit = __is.readDouble();
            this.positionprofit = __is.readDouble();
            this.totalprofile = __is.readDouble();
            this.updatedate = __is.readString();
        },
        117, 
        false);

    CM.Order = Slice.defineStruct(
        function(frontid, sessionid, privateno, exchangeid, orderid, tradingday, fundid, brokerid, requestid, instrumentid, direction, offsetflag, hedgeflag, price, volume, ordertype, orderstatus, volumetraded, insertdatetime, ordertime, oerrno, oerrmsg, updatetime)
        {
            this.frontid = frontid !== undefined ? frontid : "";
            this.sessionid = sessionid !== undefined ? sessionid : "";
            this.privateno = privateno !== undefined ? privateno : "";
            this.exchangeid = exchangeid !== undefined ? exchangeid : "";
            this.orderid = orderid !== undefined ? orderid : "";
            this.tradingday = tradingday !== undefined ? tradingday : "";
            this.fundid = fundid !== undefined ? fundid : "";
            this.brokerid = brokerid !== undefined ? brokerid : "";
            this.requestid = requestid !== undefined ? requestid : "";
            this.instrumentid = instrumentid !== undefined ? instrumentid : "";
            this.direction = direction !== undefined ? direction : "";
            this.offsetflag = offsetflag !== undefined ? offsetflag : "";
            this.hedgeflag = hedgeflag !== undefined ? hedgeflag : "";
            this.price = price !== undefined ? price : 0.0;
            this.volume = volume !== undefined ? volume : 0;
            this.ordertype = ordertype !== undefined ? ordertype : "";
            this.orderstatus = orderstatus !== undefined ? orderstatus : "";
            this.volumetraded = volumetraded !== undefined ? volumetraded : 0;
            this.insertdatetime = insertdatetime !== undefined ? insertdatetime : "";
            this.ordertime = ordertime !== undefined ? ordertime : "";
            this.oerrno = oerrno !== undefined ? oerrno : 0;
            this.oerrmsg = oerrmsg !== undefined ? oerrmsg : "";
            this.updatetime = updatetime !== undefined ? updatetime : "";
        },
        false,
        function(__os)
        {
            __os.writeString(this.frontid);
            __os.writeString(this.sessionid);
            __os.writeString(this.privateno);
            __os.writeString(this.exchangeid);
            __os.writeString(this.orderid);
            __os.writeString(this.tradingday);
            __os.writeString(this.fundid);
            __os.writeString(this.brokerid);
            __os.writeString(this.requestid);
            __os.writeString(this.instrumentid);
            __os.writeString(this.direction);
            __os.writeString(this.offsetflag);
            __os.writeString(this.hedgeflag);
            __os.writeDouble(this.price);
            __os.writeInt(this.volume);
            __os.writeString(this.ordertype);
            __os.writeString(this.orderstatus);
            __os.writeInt(this.volumetraded);
            __os.writeString(this.insertdatetime);
            __os.writeString(this.ordertime);
            __os.writeInt(this.oerrno);
            __os.writeString(this.oerrmsg);
            __os.writeString(this.updatetime);
        },
        function(__is)
        {
            this.frontid = __is.readString();
            this.sessionid = __is.readString();
            this.privateno = __is.readString();
            this.exchangeid = __is.readString();
            this.orderid = __is.readString();
            this.tradingday = __is.readString();
            this.fundid = __is.readString();
            this.brokerid = __is.readString();
            this.requestid = __is.readString();
            this.instrumentid = __is.readString();
            this.direction = __is.readString();
            this.offsetflag = __is.readString();
            this.hedgeflag = __is.readString();
            this.price = __is.readDouble();
            this.volume = __is.readInt();
            this.ordertype = __is.readString();
            this.orderstatus = __is.readString();
            this.volumetraded = __is.readInt();
            this.insertdatetime = __is.readString();
            this.ordertime = __is.readString();
            this.oerrno = __is.readInt();
            this.oerrmsg = __is.readString();
            this.updatetime = __is.readString();
        },
        39, 
        false);

    CM.DoOrder = Slice.defineStruct(
        function(fundid, exchangeid, brokerid, instrumentid, ordertype, direction, offsetflag, hedgeflag, price, volume, donetype)
        {
            this.fundid = fundid !== undefined ? fundid : "";
            this.exchangeid = exchangeid !== undefined ? exchangeid : "";
            this.brokerid = brokerid !== undefined ? brokerid : "";
            this.instrumentid = instrumentid !== undefined ? instrumentid : "";
            this.ordertype = ordertype !== undefined ? ordertype : "";
            this.direction = direction !== undefined ? direction : "";
            this.offsetflag = offsetflag !== undefined ? offsetflag : "";
            this.hedgeflag = hedgeflag !== undefined ? hedgeflag : "";
            this.price = price !== undefined ? price : 0.0;
            this.volume = volume !== undefined ? volume : 0;
            this.donetype = donetype !== undefined ? donetype : "";
        },
        false,
        function(__os)
        {
            __os.writeString(this.fundid);
            __os.writeString(this.exchangeid);
            __os.writeString(this.brokerid);
            __os.writeString(this.instrumentid);
            __os.writeString(this.ordertype);
            __os.writeString(this.direction);
            __os.writeString(this.offsetflag);
            __os.writeString(this.hedgeflag);
            __os.writeDouble(this.price);
            __os.writeInt(this.volume);
            __os.writeString(this.donetype);
        },
        function(__is)
        {
            this.fundid = __is.readString();
            this.exchangeid = __is.readString();
            this.brokerid = __is.readString();
            this.instrumentid = __is.readString();
            this.ordertype = __is.readString();
            this.direction = __is.readString();
            this.offsetflag = __is.readString();
            this.hedgeflag = __is.readString();
            this.price = __is.readDouble();
            this.volume = __is.readInt();
            this.donetype = __is.readString();
        },
        21, 
        false);
    Slice.defineSequence(CM, "DoneListHelper", "CM.Done", false);
    Slice.defineSequence(CM, "AccountListHelper", "CM.Account", false);
    Slice.defineSequence(CM, "PositionListHelper", "CM.Position", false);
    Slice.defineSequence(CM, "OrderListHelper", "CM.Order", false);
    exports.CM = CM;
}
(typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? module : undefined,
 typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? require : this.Ice.__require,
 typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? exports : this));
