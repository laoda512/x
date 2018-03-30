"use strict";
var exec = require('child_process').exec;
var wechat = require('wechat');

var resMap = new Map(); //TODO: store in redis
var dbClient;

//TODO： find the best practise to define a module
class API{

    constructor(wechatConfigs, inClient){
        this.setClient(inClient)
        this.setWechatConfigs(wechatConfigs)
    }

     setClient (inClient){
        this.inClient = inClient
    }

     setWechatConfigs (wechatConfigs){
        this.wechatConfigs = wechatConfigs
    }

     handleMessage(){
        return function (event, req, res, next){
            console.log(event)
            if(event.Event==='CLICK'&&event.EventKey==='EVENT_GET_MY_PET') {
                res.wait('pet_view')
            }
        }
    }

    handleText(){
        return function (message, req, res, next){
            console.log(message)
            res.reply("你说什么我听不懂")
        }
    }

     getMiddleware(){
        return wechat(this.wechatConfigs)
                 .event(this.handleMessage())
                 .text(this.handleText())
            .middlewarify()
    }


}

var List = wechat.List;

List.add('pet_view', [
    ['你的宠物还只是一团软泥，你说什么他似乎都还听不懂{X}', function (info, req, res) {
        res.reply('你的宠物现在就是一团');
    }],
    ['回复{A}查看你的宠物', function (info, req, res) {
        res.reply('你的宠物呆呆的望着你，似乎什么都不懂');
    }],
    ['回复{B}带他转转', function (info, req, res) {
        res.reply('你尝试着带他转转，你的宠物呆呆的望着你，不明白你在做什么');
    }],
    ['回复{C}给它打扮', function (info, req, res) {
        res.reply('你尝试着打扮你的宠物，可他还只是一摊软泥！');
    }]
]);

//parse words module, end *********************


module.exports = API