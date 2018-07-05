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
var fs = require('fs');
var session = require('express-session')
var merge = require('./src/util/merge')
var WechatAPI = require('wechat-api');

bluebird.promisifyAll(rediz.RedisClient.prototype);
bluebird.promisifyAll(rediz.Multi.prototype);

var DemoServer = require('./src/demoServer');
var handler_demoServer = new DemoServer(redis);

var fakeResponse = require('./src/middleware/fakeResponse')
var requestPrinter = require('./src/middleware/requestPrinter')
var FakeRequest = require('./src/middleware/fakeRequest')
var bodyParser = requestPrinter.bodyParser
var rawDataPrinter = requestPrinter.rawDataPrinter({isEnable: true})
var mCallback = require('./src/util/DefaultCallback')
//use test server or not
var testMode = true;
var fakeMode = false;

var api=require('./src/util/API')

redis.on('error', function (err) {
    console.log('errorevent - ' + redis.host + ': ' + redis.port + ' - ' + err);
});


//TODO: store in config file


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
WechatAPI.patch("getKF", "https://api.weixin.qq.com/customservice/getkflist");
WechatAPI.patch("createKF", "https://api.weixin.qq.com/customservice/kfaccount/add");
var jsoninfo1={
     "kf_account" : "kf1@gh_9a61b0c443f1",
     "nickname" : "客服1",
     "password" : "pswmd5",
     "kf_id" : "test",
     "kf_headimgurl": "https://www.baidu.com/img/pcindex_small.png"
}
api.uploadMaterial('./res/timg.jpg', 'image', mCallback);
api.uploadMaterial('./res/timg.jpg', 'thumb', mCallback);
api.uploadMaterial('test.gif', 'image', mCallback);
api.uploadMaterial('test.gif', 'thumb', mCallback);
// 调用刚扩展的方法，与其它 api 接口方法一样。
//api.addKfAccount('test@gh_9a61b0c443f1', 'nickname', 'password', mCallback);
//api.createKF(jsoninfo1, mCallback);
//api.getCustomServiceList(mCallback)
//api.removeMenu(getCallback('rm menu'));
//api.createMenu(menu,getCallback('cr menu'));

