"use strict";
var exec = require('child_process').exec;
var Promise = require('bluebird');
var wechat = Promise.promisifyAll(require('wechat'));
var WechatAPI = require('wechat-api');
var api = Promise.promisifyAll(new WechatAPI('wx1193af7037eb6f76', 'bf2271c652870f76be20c3afbb4deab4'))
var cb = require('./util/DefaultCallback')

var testImageGFTemp = '6U8npijgH7WXpI-pNxvceMpu2DvRGiIHMJhwyv0k1L7Ez2khU2Zb-sGW4felgkR-'
var testImageRN = 'IHRytypKj0BtqAlCOjsSlDtAuG6OvhPCOtZCH5ORB-c'
var testThumbRN = 'IHRytypKj0BtqAlCOjsSlHMD5tuBTh4gM_7l-pbAELw'
var testImageGF = 'IHRytypKj0BtqAlCOjsSlOrKPhJZSy961bdC4k62kII'
var testThumbGF = 'IHRytypKj0BtqAlCOjsSlIHaMegpCo1fR0oYWjnis6I'

var sleep = Promise.promisifyAll(setTimeout)

function sendText(userID, kfID, content) {
    return api.sendTextFromCsAsync(userID, kfID, content)
}

function sendImage(userID, kfID, content) {
    return api.sendImageFromCsAsync(userID, kfID, content)
}


//api.sendTextFromCs(info.FromUserName, 'kfc', testThumbGF, cb)

//TODO： find the best practise to define a module
class API {

    constructor(wechatConfigs, inClient) {
        this.setClient(inClient)
        this.setWechatConfigs(wechatConfigs)
    }

    setClient(inClient) {
        this.dbClient = inClient
    }

    setWechatConfigs(wechatConfigs) {
        this.wechatConfigs = wechatConfigs
    }

    handleMessage() {
        return function (event, req, res, next) {
            console.log(event)
            if (event.Event === 'CLICK' && event.EventKey === 'EVENT_GET_MY_PET') {
                //api.sendImageFromCsAsync(event.FromUserName, 'kf1',testImageRN, cb)
                res.wait('pet_event')
            } else {
                console.log('no match event')
                console.log(JSON.stringify(req.wxsession))
                api.sendTextFromCs(event.FromUserName, 'test', 'opps, sth error', cb);
                res.wait('pet_event')
            }
        }
    }

    handleText() {
        return function (message, req, res, next) {
            console.log(message)
            res.reply("你说什么我听不懂")
        }
    }

    getMiddleware() {
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
        res = Promise.promisifyAll(res)
        console.log(JSON.stringify(info))
        api.sendImageFromCsAsync(info.FromUserName, 'kfc', testThumbGF, cb).then(console.log('1111111'))
            .then(api.sendImageFromCsAsync(info.FromUserName, 'kf2', testImageGF, cb)
                .then(console.log('22222')))
            .then(res.waitAsync('pet_view')
                .then(console.log('over33333')))
            .then(console.log('over'))
    }],
    ['回复{B}带他转转', function (info, req, res) {
        res.reply('你尝试着带他转转，你的宠物呆呆的望着你，不明白你在做什么');
    }],
    ['回复{C}给它打扮', function (info, req, res) {
        res.reply('你尝试着打扮你的宠物，可他还只是一摊软泥！');
    }]
]);

List.add('pet_next', [
    ['你的aaaaaa{X}', function (info, req, res) {
        res.reply('你的宠物现在就是一团');

    }],
    ['回复{A}查看你的宠物', function (info, req, res) {
        res.reply('你的宠物呆呆的望着你，似乎什么都不懂');
        console.log(JSON.stringify(info))
        api.sendTextFromCs(info.FromUserName, 'test', 'Hello world', cb);

        api.sendImageFromCsAsync(info.FromUserName, 'kfx', testThumbRN, cb)
    }],
    ['回复{B}带他转转', function (info, req, res) {
        res.reply('你尝试着带他转转，你的宠物呆呆的望着你，不明白你在做什么');
        api.sendImageFromCsAsync(info.FromUserName, 'kfx', testImageGFTemp, cb)
    }],
    ['回复{C}给它打扮', function (info, req, res) {
        res.reply('你尝试着打扮你的宠物，可他还只是一摊软泥！');
    }]
]);

//parse words module, end *********************


module.exports = API

List.add('pet_event', [
    ['{A}:走起，进入微信支付', function (info, req, res) {
        api.sendTextFromCsAsync(event.FromUserName, 'you', '👉你不愧是远近闻名的大土豪，毫不犹豫地同意了付款')
            .delay(500)
            .then(re => api.sendTextFromCsAsync(event.FromUserName, 'test', '2')
            ).delay(500)
            .then(re => sendText(event.FromUserName, 'test', '2')
            ).delay(500)
            .then(re => res.reply('4'))


        api.sendTextFromCs(info.FromUserName, 'you', '', function (err, message) {
            if (err) {
                console.log(err)
            } else {
                api.sendTextFromCs(info.FromUserName, 'terminal', '🤩这么爽快的吗？有钱人的世界我不懂，可宠老大说现在要使用免费策略勾引' +
                    '。。🤭，嗯，我是说可我还是需要拒绝你，因为我们觉得比起金钱，暖宝宝更需要你的关怀哦～所以这次看你这么有诚意，' +
                    '就免费让你领取一只暖宝宝好啦！\n 😎', function (err, message) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.wait('pet_view')
                    }
                })

            }
        })
    }],
    ['{B}:残忍拒绝', function (info, req, res) {
        api.sendTextFromCsAsync(info.FromUserName, 'you', '👉去你*的，你一眼就看出了这是个骗钱的把戏，举起了拳头，一脸凶恶的看着眼前的终端', cb)
            .delay(500)
            .then(api.sendTextFromCsAsync(info.FromUserName, 'terminal', '😨不，不要动手。。冷。。冷静，这只是一个测试，确认你是否真的喜爱暖宝宝，毕竟比起金钱，主人对暖宝宝的关怀更加重要～所。。所以这次看你这么有诚意，就免费让你领取一只暖宝宝好啦！\n 😅'))
            .delay(500)
            .then(res.wait('pet_next'))

    }],
    ['{C}:太贵了！', function (event, req, res) {
        var response
        var wait = new Promise(function (resolve, reject) {
            res.waitWithResponse('pet_next', '0', function (err, res) {
                if (err)
                    reject(err)
                else {
                    console.log(res)
                    resolve(res)
                }
            })
        })
        wait.then(re => response = re.description)
            .delay(500)
            .then(re => sendText(event.FromUserName, 'test', '1'))
            .delay(500)
            .then(re => sendText(event.FromUserName, 'test', '2')
            ).delay(500)
            .then(re => sendText(event.FromUserName, 'test', '2')
            ).delay(500)
            .then(re => sendText(event.FromUserName, 'test', response))

    }],
    ['{D}:我有推荐码', function (info, req, res) {
        res.reply('todo')
            .delay(500)
            .then(res.wait('pet_next'))``
    }]
], '暖星宠物终端链接中。。。\n\n系统检测到您还没有宠物，是否花费99999999元购买一只可爱的暖宝宝？\n', ' ', ' ');

var template = {
    response: {
        action: 'reply',
        type: 'image',
        content: '',
        next: {
            events: [
                {key: 1, event: 'p1'},
                {key: 2, event: 'p2'},
                {key: 3, event: 'p3'},
                {key: 4, event: 'p4'},
                {key: 5, event: 'p5'},
            ]
        },
        delay: 500
    },
    KeFuMsg: [
        {action: 'reply', from: 'npc1', MsgType: 'image', Msg: '', delay: 500},
        {action: 'reply', from: 'npc1', MsgType: 'image', Msg: '', delay: 500},
    ]
}



