# API gateway to query system services

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
地址：https://invesmart.net/api/public/doc

## Init
```
npm init
```
