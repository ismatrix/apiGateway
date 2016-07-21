# API gateway to query system services

## Install
```
npm i -g pm2
npm install
```

## Dev
```
DEBUG=*,-babel,-engine*,-socket.io-parser,-socket.io:client DEBUG_COLORS=true pm2 start src/index.js --watch --no-autorestart --name apiGateway
pm2 logs --raw
```

## Prod
```
npm run compile
DEBUG=*,-babel,-engine*,-socket.io-parser,-socket.io:client DEBUG_COLORS=true pm2 start lib/app.js --name apiGateway
```
