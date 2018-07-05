init:
	apt update
	apt -y install nodejs-legacy
	apt -y install nam
	npm install -g forever
	#docker load -i $(CURDIR)/dockers/redis/.redis
	docker pull redis
	make container
	npm install


container:
	docker build -t slimerjs_x:0.0.1 .


capture: 
	docker run --rm -i \
	-v $(CURDIR):/phantomjs/script/all \
	-v $(CURDIR)/result:/phantomjs/script/result \
	-v $(CURDIR)/phantomjs:/phantomjs/script/phantomjs \
	--name $(container_name) \
	slimerjs_x:0.0.1 /bin/bash -c " \
	slimerjs \
	/phantomjs/script/phantomjs/untitled.js http://www.dicts.cn/dict/dict/dict!searchhtml3.asp?id= /phantomjs/script/result/test2.png $(word) $(mode) 	"
#  slimerjs_config:	
# 	docker run --rm -i \
# 	-v $(CURDIR)/result:/phantomjs/script/all \
# 	slimerjs_x:0.0.1 /bin/bash -c "\
# 	slimerjs -CreateProfile /phantomjs/script/all/phantomjs/myNewProfile"

test: 
	docker run --rm -i \
	-v $(CURDIR):/phantomjs/script/all \
	-v $(CURDIR)/result:/phantomjs/script/result \
	-v $(CURDIR)/phantomjs:/phantomjs/script/phantomjs \
	--name $(container_name) \
	slimerjs_x:0.0.1 /bin/bash -c " \
	slimerjs \
	/phantomjs/script/phantomjs/untitled.js https://www.toutiao.com/c/user/98010297733/ /phantomjs/script/result/test2.png $(word) $(mode) 	"



start_redis:
	nohup docker run  --rm \
	-p 6379:6379 \
	-v $(CURDIR)/node_storage/redis:/data \
	-v $(CURDIR)/redis.conf:/usr/local/etc/redis/redis.conf \
	--name redis1 redis \
	redis-server /usr/local/etc/redis/redis.conf >> redis_log 2>&1 &


check_redis:
	docker run --rm -it redis-server /bin/bash
 	

create_net:
	docker network create --subnet=172.18.0.0/16 mynet123

