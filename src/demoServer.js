"use strict";

var resMap = new Map(); //TODO: store in redis

var API = {}
API.handleMessage = function(req, res, next) {

    console.log('req');
    res.reply("aaaaa");
    // 微信输入信息都在req.weixin上
    var message = req.weixin;

    console.log(JSON.stringify(message));

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
}

module.exports = API