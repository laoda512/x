'use strict'
//to api directly
//TODO: clean the imports
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


//TODO: store in config file
if (!testMode) {
    var api = new WechatAPI('wx987b7963b6cbf3e2', 'b3731adce531050a30fd94da3fc36c76');
} else {
    var api = new WechatAPI('wx1193af7037eb6f76', 'bf2271c652870f76be20c3afbb4deab4');
}

api.getAccessToken(function (err, token) {
    if (err) {
        console.log(err)
    } else {
        console.log(token)
    }
})

var getCallback = function (tag) {
    return function (err, res) {
        if (err) {
            console.log(err)
        } else {
            console.log(res)
        }
    }
}

var menu = {
    "button": [
        {
            "type": "click",
            "name": "我的宠物",
            "key": "EVENT_GET_MY_PET"
        },
        {
            "name": "回复",
            "sub_button": [
                {
                    "type": "click",
                    "name": "选择A",
                    "key": "A"
                },
                {
                    "type": "click",
                    "name": "选择B",
                    "key": "B"
                },
                {
                    "type": "click",
                    "name": "选择C",
                    "key": "C"
                },
                {
                    "type": "click",
                    "name": "选择D",
                    "key": "D"
                }]
        }]
}
api.removeMenu(getCallback('rm menu'));
api.createMenu(menu,getCallback('cr menu'));

