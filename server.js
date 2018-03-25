var connect = require('connect');
var express = require('express');
var http = require('http');
var rediz = require("redis"),
    redis = rediz.createClient()
var bluebird = require('bluebird');
var WechatAPI = require('wechat-api');
var https = require('https');
var fs = require('fs');

bluebird.promisifyAll(rediz.RedisClient.prototype);
bluebird.promisifyAll(rediz.Multi.prototype);

var handlerDemoServer = require('./src/demoServer')

testMode = true



var sys = require('sys'),
    exec = require('child_process').exec;

//var express = Express();
var app = express();
var wechat = require('wechat');
redis.on('error', function(err) {
    console.log('errorevent - ' + redis.host + ': ' + redis.port + ' - ' + err);
});

var sslOptions = {
    key: fs.readFileSync('ssl/server-key.pem'),
    cert: fs.readFileSync('ssl/server-crt.pem'),
    ca: fs.readFileSync('ssl/ca-crt.pem'),
};

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



// // parse urlencoded request bodies into req.body
// var bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: false }));
var wechat_test = function(config, func) {
    var fun = func;
    var config = config;

    var client = function(req, res, next) {

        if (false) {
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


app.use('/wechat', wechat_test(wechatConfig, handlerDemoServer.handleMessage));

function handleMessage(message, req, res, next) {
    if (message.FromUserName === 'diaosi') {
        // 回复屌丝(普通回复)
        res.reply('hehe');
    } else if (message.FromUserName === 'text') {
        //你也可以这样回复text类型的信息
        res.reply({
            content: 'text object',
            type: 'text'
        });
    } else if (message.FromUserName === 'hehe') {
        // 回复一段音乐
        res.reply({
            type: "music",
            content: {
                title: "来段音乐吧",
                description: "一无所有",
                musicUrl: "http://mp3.com/xx.mp3",
                hqMusicUrl: "http://mp3.com/xx.mp3",
                thumbMediaId: "thisThumbMediaId"
            }
        });
    } else if (message.Content.startsWith('666')) {

        var response = api.getToken(function(err, token) {
            result = JSON.stringify(err) + '***' + JSON.stringify(token)
            res.reply({
                content: result,
                type: 'text'
            });
        })


    } else if (message.Content.startsWith('/::)')) {
        var word = message.Content.substring('/::)'.length).trim()
        redis.get(getKey(word), function(err, record) {
            if (record) {

                handleResponse(JSON.parse(record), message)
            } else {
                var dockerName = word + Math.random();
                console.log("create docker " + dockerName)
                child = exec('make word=' + word + ' container_name=' + dockerName + ' mode=aa capture',

                    function(error, stdout, stderr) {
                        console.log(stdout, stderr); // Always empty
                        var response = handleDicts(stdout, word);

                        if (response.isSuccess) {
                            redis.set(getKey(word), JSON.stringify(response))
                        }

                        handleResponse(response, message)
                    });

                setTimeout(function() {
                    exec("docker kill " + dockerName, function(error, stdout, stderr) {
                        console.log(stdout, stderr);
                    })
                }, 12000);
            }
            // res.reply();
            // res.reply([{
            //     title: '你来我家接我吧',
            //     description: '这是女神与高富帅之间的对话',
            //     picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
            //     url: 'http://nodeapi.cloudfoundry.com/'
            // }]);
        });

    } else {
        var response = "请输入/::)+单词 查询，输入/::~ 查看帮助，恩，也就是现在这段话啦。。)"
        res.reply({
            content: response,
            type: 'text'
        });
    }
}

function getKey(word) {
    return 'word.cg.dicts:' + word
}

//create node.js http server and listen on port
var server = https.createServer(sslOptions, app).listen(443, function() {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)
        // var word = 'helpful'

});

function handleDicts(stdout, word) {
    var response = { content: "", isSuccess: false };
    try {

        var result = stdout;
        var data = result.substr(result.indexOf('{'))
        console.log(data);
        var dataJson = JSON.parse(data);

        switch (dataJson.result) {
            case "not_found":
                response.content = 'This word is not exist.'
                response.isSuccess = false;
                redis.set("word:" + word, response);
                break;
            case "timeout":
                response.content = 'Request timeout.'
                response.isSuccess = false;
                break;
            case "no_detail":
                response.content = 'This word is too simple.'
                response.isSuccess = true;
                break;
            case "found":
                response.content = dataJson.etymaJson;
                response.isSuccess = true;
                break;
            default:
                response.content = 'Unknown error.'
                response.isSuccess = false;
        }
    } catch (err) {
        console.log(err)
        response.content = 'Parse error.'
        response.isSuccess = false;
    }
    console.log(JSON.stringify(response))
    return response;
}

function handleResponse(dataJson, message) {
    var content = ""
    try {

        if (dataJson.isSuccess) {
            content = drawTree([JSON.parse(dataJson.content)]);
        } else {
            content = dataJson.content;
        }

    } catch (err) {
        content = dataJson.content;
    }

    try {
        realRes = resMap.get(message.MsgId)
        if (realRes != null) {
            realRes.reply({
                content: content,
                type: 'text'
            });
            resMap.set(message.MsgId, 'over')
            console.log("request responsed " + message.MsgId);
        } else {
            console.log('no res! ' + message.MsgId)
        }
    } catch (err) {
        console.log('response error! ' + err + " " + message.MsgId)
    }

    return content
}

function drawTree(el) {
    try {
        var s = ""; //
        var x = 0
        for (var X = 0; X < el.length; X++) {
            if (el[X]) {
                s += el[X].w + " " + (el[X].m ? el[X].m : "");
                s += "\n";
                if (el[X] && el[X].ps) {
                    s += el[X].w + "的词根\n" + drawTree(el[X].ps);
                }

                if (el[X] && el[X].cs) {
                    s += el[X].w + "的相关词\n" + drawTree(el[X].cs);
                }

            }
        }
    } catch (err) {
        console.log(err)
            //var response = "Parse error.";
        s = el
    }
    return s
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}