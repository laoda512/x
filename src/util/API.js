'use strict'
var WechatAPI = require('wechat-api');
var testMode = true
 if (!testMode) {
        var api = new WechatAPI('wx987b7963b6cbf3e2', 'b3731adce531050a30fd94da3fc36c76');
    } else {
        var api = new WechatAPI('wx1193af7037eb6f76', 'bf2271c652870f76be20c3afbb4deab4');
    }

exports = module.exports = api

