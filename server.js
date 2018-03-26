'use strict'
//TODO: move into src/

var connect = require('connect');
var express = require('express');
var http = require('http');
var https = require('https');
var rediz = require("redis"),
    redis = rediz.createClient()
var sys = require('sys'),
    exec = require('child_process').exec;
var wechat = require('wechat');
var bluebird = require('bluebird');
var WechatAPI = require('wechat-api');
var fs = require('fs');

bluebird.promisifyAll(rediz.RedisClient.prototype);
bluebird.promisifyAll(rediz.Multi.prototype);

var DemoServer = require('./src/demoServer');
var handler_demoServer = new DemoServer(redis);
//use test server or not
var testMode = true;
var fakeMode = false;

//var express = Express();
var app = express();

redis.on('error', function(err) {
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

//enable printing redis error
redis.on('error', function(err) {
    console.log('errorevent - ' + redis.host + ': ' + redis.port + ' - ' + err);
});


//TODO: replace with node router
//fake return, for debugging
var wechat_test = function(config, func) {
    var fun = func;
    var config = config;

    var client = function(req, res, next) {
        //Set to true to get a fake return with any request.
        if (fakeMode) {
            req.weixin = { "ToUserName": "gh_811891b39f33", "FromUserName": "oIIy1t9lPOfnGLlclJaRQZqZJWuk", "CreateTime": "1503504430", "MsgType": "text", "Content": "/::)happily", "MsgId": "6457502356607278610" };
            res.reply = function(json) {
                res.send(JSON.stringify(json))
            }
        } else {
            console.log('errorevent - ');
            fun = wechat(config, func)
        }
        fun(req, res, next);
    }
    return client;
}


app.use(express.query());

app.use('/wechat', wechat_test(wechatConfig, handler_demoServer.handleMessage));

//create node.js http server and listen on port
var server = https.createServer(sslOptions, app).listen(443, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
});
