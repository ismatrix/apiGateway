#!/bin/bash

# nodejs grpc ssl ֤��

#host="127.0.0.1"
host="www.test.cn"

#����˽��key
openssl genrsa -out private.pem.key 2048/4096

#���ɸ�֤��
openssl req -new -x509 -key private.pem.key  -out rootCA.pem.crt  -days 36500 -subj "/C=/ST=/L=/O=/OU=/CN=ROOT CA"

#��˽��key����һ��֤�������ļ�
openssl req -new -key private.pem.key -out crt_req.csr  -subj "/C=/ST=/L=/O=/OU=/CN=${host}"


#������ĸ�֤��䷢һ��ǩ��֤��
openssl x509 -req -days 36500 -in crt_req.csr -CA rootCA.pem.crt -CAkey private.pem.key  -CAcreateserial -out new_ca.pem.crt


#��֤˽��key
openssl rsa -in private.pem.key -text -noout

#��֤֤�������ļ�
openssl req -in crt_req.csr -text -noout


#��֤֤��
openssl x509 -in rootCA.pem.crt -text -noout
openssl x509 -in new_ca.pem.crt -text -noout


cp ./private.pem.key ../fundGateway/crt/funds.invesmart.net.key
cp ./new_ca.pem.crt  ../fundGateway/crt/funds.invesmart.net.crt
cp ./rootCA.pem.crt  ../fundGateway/node_modules/sw-grpc-client/crt/rootCA.pem

cp ./private.pem.key ../marketDataGateway/crt/markets.invesmart.net.key
cp ./new_ca.pem.crt  ../marketDataGateway/crt/markets.invesmart.net.crt
cp ./rootCA.pem.crt  ../marketDataGateway/node_modules/sw-grpc-client/crt/rootCA.pem

cp ./rootCA.pem.crt  ../apiGateway/node_modules/sw-grpc-client/crt/rootCA.pem



pm2 restart marketDataGateway
pm2 restart fundGateway
pm2 restart apiGateway






