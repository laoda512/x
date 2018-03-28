"use strict";

var resMap = new Map(); //TODO: store in redis
var dbClient;

//TODO： find the best practise to define a module
var API = function (inClient) {
    var self = this;

    var setClient = function (inClient) {
        dbClient = inClient;
    };
    setClient(inClient);
}



API.prototype.handleMessage = function (req, res, next) {

    console.log('demo server handleMessage');
    var message = req.weixin;

    console.log(JSON.stringify(message));
    //Wechat server will resend request if there is no response in 5s.
    // Ignore if the message is already handled
    //TODO: refine this in an elegant, easy reading way
    if (message && message.MsgId) {
        console.log("verifiey request type over ") + message.MsgId;
        if (resMap.get(message.MsgId)) {
            console.log("has request record" + message.MsgId);
            if (resMap.get(message.MsgId) === 'over') {
                console.log("this request was over" + message.MsgId);
                return;
            }
            console.log("this request was handled " + message.MsgId);
            resMap.set(message.MsgId, res);
        } else {
            console.log("handle request " + message.MsgId);
            resMap.set(message.MsgId, res);
            handleMessage(message, req, res, next);
        }
    } else {
        console.log("unknown message");
        res.reply(JSON.stringify(message));
    }
};


//TODO: make a seperate message router
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

        var response = api.getToken(function (err, token) {
            var result = JSON.stringify(err) + '***' + JSON.stringify(token)
            res.reply({
                content: result,
                type: 'text'
            });
        })


    } else if (message.Content.startsWith('/::)')) {

        //TODO: move this into a seperate module
        var word = message.Content.substring('/::)'.length).trim()
        dbClient.get(getKey(word), function (err, record) {
            if (record) {
                handleResponse(JSON.parse(record), message)
            } else {
                var dockerName = word + Math.random();
                console.log("create docker " + dockerName)
                exec('make word=' + word + ' container_name=' + dockerName + ' mode=aa capture',

                    function (error, stdout, stderr) {
                        console.log(stdout, stderr); // Always empty
                        var response = handleDicts(stdout, word);

                        if (response.isSuccess) {
                            dbClient.set(getKey(word), JSON.stringify(response))
                        }

                        handleResponse(response, message)
                    });

                setTimeout(function () {
                    exec("docker kill " + dockerName, function (error, stdout, stderr) {
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


//TODO: move them into a seperate module
//parse words module, start *********************
function handleDicts(stdout, word) {
    var response = {content: "", isSuccess: false};
    try {

        var result = stdout;
        var data = result.substr(result.indexOf('{'))
        console.log(data);
        var dataJson = JSON.parse(data);

        switch (dataJson.result) {
            case "not_found":
                response.content = 'This word is not exist.'
                response.isSuccess = false;
                dbClient.set("word:" + word, response);
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
        var realRes = resMap.get(message.MsgId)
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

function getKey(word) {
    return 'word.cg.dicts:' + word
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
//parse words module, end *********************


module.exports = API