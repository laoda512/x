RUN

Ubuntu:
make init
make  start_redis
sudo node server.js

if you run in local, set fakeMode=true in server.js
then run 'curl -k  https://localhost:443/wechat?test'
you can see the logs


MAC:
TODO:



