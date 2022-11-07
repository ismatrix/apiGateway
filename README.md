# apiGateway of RESTFUL system services

<p align="center">
    <img src ="https://img.shields.io/badge/version-3.0.0-blueviolet.svg"/>
    <img src ="https://img.shields.io/badge/platform-windows|linux|macos-yellow.svg"/>
    <img src ="https://img.shields.io/badge/nodejs-6.0+-blue.svg" />
    <img src ="https://img.shields.io/github/workflow/status/vnpy/vnpy/Python%20application/master"/>
    <img src ="https://img.shields.io/github/license/vnpy/vnpy.svg?color=orange"/>
</p>

商品期货行情、交易RESTFUL服务，上游通过 [fundGateway](https://github.com/ismatrix/fundGateway) 接入 [marketdataGateway](https://github.com/ismatrix/marketDataGateway)， 通过[gRPC]对外提供https的行情及交易接口

## Install
```
npm i -g pm2
npm install
```

## Prod
```
NODE_ENV=production DEBUG_FD=1 DEBUG=*,-babel,-koa-router,-koa-mount,-engine*,-socket.io-parser,-socket.io:client DEBUG_COLORS=true pm2 start src/index.js  --log-date-format="MM-DD HH:mm:ss" --name apiGateway
```

## 重启
```
pm2 restart apiGateway
```

## 日志
```
pm2 logs apiGateway
~/.pm2/logs  # 日志文件路径
```

## 文档
地址：https://quantowin.com:8808/api/public/doc

## Init
```
npm init
```
