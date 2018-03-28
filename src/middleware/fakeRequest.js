
/**
 * Created by cwang on 3/27/18.
 */
"use strict";
var merge = require('../util/merge')
module.exports = class fakeRequest {
    constructor(isEnable){
        this.isEnable = isEnable
        this.getFakeRequest = this.getFakeRequest.bind(this)
    }

    getFakeRequest (req, res, next) {
        //Set to true to get a fake return with any request.
        if (this.isEnable) {
            console.log(req.body)
            req.weixin = merge ({
                "ToUserName": "gh_811891b39f33",
                "FromUserName": "oIIy1t9lPOfnGLlclJaRQZqZJWuk",
                "CreateTime": "1503504430",
                "MsgType": "text",
                "Content": "/::)happily",
                "MsgId": "6457502356607278610"
            }, req.body)

            res.reply = function (json) {
                res.send(JSON.stringify(json))
            }
        }
       // fun(req, res, next);
        next()
    }

};
