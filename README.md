# API gateway to query system services

## Install
```
npm i -g pm2
npm install
```

## Dev
```
NODE_ENV=development DEBUG_FD=1 DEBUG=*,-babel,-koa-router,-koa-mount,-engine*,-socket.io-parser,-socket.io:client DEBUG_COLORS=true pm2 start src/index.js --watch src --no-autorestart --log-date-format="MM-DD HH:mm:ss" --name apiGateway --node-args="--inspect=9232"
pm2 logs apiGateway --raw
```

## Prod
```
npm run compile
NODE_ENV=production DEBUG_FD=1 DEBUG=*,-babel,-koa-router,-koa-mount,-engine*,-socket.io-parser,-socket.io:client DEBUG_COLORS=true pm2 start dist/app.js  --log-date-format="MM-DD HH:mm:ss" --name apiGateway --node-args="--inspect=9242"
```
