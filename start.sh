#!/bin/sh

#mongod -f /etc/mongod.conf 

#1. 机器重启之后 防火墙的问题
#2. 机器重启之后服务的启动
#3. 程序自动重启的问题 监控重启（node 全部用pm2   c全部用自己的）


redis-server  --port 6379  --daemonize yes

redis-server  --port 6380  --daemonize yes


cd /home/ops/code/apiGateway  && NODE_ENV=production DEBUG_FD=1 DEBUG=*,-babel,-koa-router,-koa-mount,-engine*,-socket.io-parser,-socket.io:client DEBUG_COLORS=true pm2 start src/index.js  --log-date-format="MM-DD HH:mm:ss" --name apiGateway

cd /home/ops/code/marketDataGateway && NODE_ENV=production DEBUG_FD=1 DEBUG=*,-babel DEBUG_COLORS=true pm2 start src/index.js --log-date-format="MM-DD HH:mm:ss" --name marketDataGateway -- --credentials-name markets.invesmart.net

cd /home/ops/code/fundGateway && NODE_ENV=production DEBUG_FD=1 DEBUG=*,-babel,-sw-fund-smartwin-futures-calculations:* DEBUG_COLORS=true pm2 start src/index.js --log-date-format="MM-DD HH:mm:ss" --name fundGateway -- --fund-configs-source mongodb --credentials-name funds.invesmart.net



