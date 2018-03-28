'use strict'
//TODO: move into src/
var connect = require('connect');
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var rediz = require("redis"),
    redis = rediz.createClient()
var sys = require('sys')
var wechat = require('wechat');
var bluebird = require('bluebird');
var WechatAPI = require('wechat-api');
var fs = require('fs');
var session = require('express-session')
var merge = require('./src/util/merge')

bluebird.promisifyAll(rediz.RedisClient.prototype);
bluebird.promisifyAll(rediz.Multi.prototype);

var DemoServer = require('./src/demoServer');
var handler_demoServer = new DemoServer(redis);

var fakeResponse = require('./src/middleware/fakeResponse')
var requestPrinter = require('./src/middleware/requestPrinter')
var FakeRequest = require('./src/middleware/fakeRequest')
var bodyParser = requestPrinter.bodyParser
var rawDataPrinter = requestPrinter.rawDataPrinter({isEnable: true})
//use test server or not
var testMode = true;
var fakeMode = false;

redis.on('error', function (err) {
    console.log('errorevent - ' + redis.host + ': ' + redis.port + ' - ' + err);
});

var sslOptions = {
    key: fs.readFileSync('ssl/server-key.pem'),
    cert: fs.readFileSync('ssl/server-crt.pem'),
    ca: fs.readFileSync('ssl/ca-crt.pem'),
};

//TODO: store in config file
if (!testMode) {
    //real
    var wechatConfig = {
        token: 'oj3bmyaxodgrxdkimbbohhgb2j1kfrgs',
        appid: 'wx987b7963b6cbf3e2',
        encodingAESKey: 'FFK1ERSHo4rrr7QkeltEFVt4jYjYBGAjmv0SJZ2oSVx',
        checkSignature: false // 可选，默认为true。由于微信公众平台接口调试工具在明文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
    };

    // init wechat api
    var api = new WechatAPI('wx987b7963b6cbf3e2', 'b3731adce531050a30fd94da3fc36c76');
} else {
    //test tokens
    var wechatConfig = {
        token: 'oj3bmyaxodgrxdkimbbohhgb2j1kfrgs',
        appid: 'wx1193af7037eb6f76',
        encodingAESKey: 'FFK1ERSHo4rrr7QkeltEFVt4jYjYBGAjmv0SJZ2oSVx',
        checkSignature: false // 可选，默认为true。由于微信公众平台接口调试工具在明文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
    };
    var api = new WechatAPI('wx1193af7037eb6f76', 'bf2271c652870f76be20c3afbb4deab4');
}

app.use(express.query());
app.use(session({secret: 'keyboard cat', cookie: {maxAge: 60000}}));
app.use('/wechat', bodyParser)
app.use('/wechat', fakeResponse({isEnable: false}))
app.use('/wechat', new FakeRequest(fakeMode).getFakeRequest)
//app.use('/wechat', rawDataPrinter)
var List = require('wechat').List;
List.add('view', [
    ['回复{a}查看我的性别', function (info, req, res) {
        res.reply('我是个妹纸哟');
    }],
    ['回复{b}查看我的年龄', function (info, req, res) {
        res.reply('我今年18岁');
    }],
    ['回复{c}查看我的性取向', '这样的事情怎么好意思告诉你啦- -']
]);
app.use('/wechat', wechat(wechatConfig, wechat.text( handler_demoServer.handleMessage)));

//create node.js http server and listen on port
var server = https.createServer(sslOptions, app).listen(443, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Listen http://%s:%s", host, port)
});

