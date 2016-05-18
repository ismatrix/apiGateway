# API gateway to query system services

## Install
```
npm i -g pm2
npm install
```

## Dev
```
DEBUG=*,-babel pm2 start src/index.js --watch
pm2 logs
```

## Prod
```
npm run compile
DEBUG=*,-babel pm2 start lib/app.js
```
