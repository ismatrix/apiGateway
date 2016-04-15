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
// Generated from file `MdLiveSession.ice'
//
// Warning: do not edit this file.
//
// </auto-generated>
//

(function(module, require, exports)
{
    var Ice = require("ice").Ice;
    var __M = Ice.__M;
    var Glacier2 = require("ice").Glacier2;
    var psd = require("./stdef").psd;
    var Slice = Ice.Slice;

    var MdLive = __M.module("MdLive");

    MdLive.MdSessionCallBack = Slice.defineObject(
        undefined,
        Ice.Object, undefined, 1,
        [
            "::Ice::Object",
            "::MdLive::MdSessionCallBack"
        ],
        -1, undefined, undefined, false);

    MdLive.MdSessionCallBackPrx = Slice.defineProxy(Ice.ObjectPrx, MdLive.MdSessionCallBack.ice_staticId, undefined);

    Slice.defineOperations(MdLive.MdSessionCallBack, MdLive.MdSessionCallBackPrx,
    {
        "InstrumentStatic": [, , , , , [3], [[psd.InstrumentStatic]], , , , ],
        "TickerItem": [, , , , , [3], [[7], [psd.Ticker]], , , , ],
        "KlineItem": [, , , , , [3], [[7], [psd.KlineItem], [psd.KlineType.__helper]], , , , ],
        "NotifySub": [, , , , , [3], [[3], [7]], , , , ]
    });

    MdLive.MdSession = Slice.defineObject(
        undefined,
        Ice.Object,
        [
            Glacier2.Session
        ], 2,
        [
            "::Glacier2::Session",
            "::Ice::Object",
            "::MdLive::MdSession"
        ],
        -1, undefined, undefined, false);

    MdLive.MdSessionPrx = Slice.defineProxy(Ice.ObjectPrx, MdLive.MdSession.ice_staticId, [
        Glacier2.SessionPrx]);

    Slice.defineOperations(MdLive.MdSession, MdLive.MdSessionPrx,
    {
        "setCallBack": [, , , , , [3], [["MdLive.MdSessionCallBackPrx"]], , , , ],
        "refresh": [, , , , , , , , , , ],
        "subscribeMd": [, , , , , [3], [[7], [7], [3]], , , , ],
        "unSubscribeMd": [, , , , , [3], [[7], [7], [3]], , , , ],
        "QuerySession": [, , , , , [7], , , , , ],
        "QuerySubCurrent": [, , , , , [7], , , , , ],
        "QueryTicker": [, , , , , [7], [[7]], , , , ],
        "QueryKline": [, , , , , [7], [[7]], , , , ],
        "QuerySnap": [, , , , , [7], [[7]], , , , ]
    });
    exports.MdLive = MdLive;
}
(typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? module : undefined,
 typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? require : this.Ice.__require,
 typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? exports : this));
