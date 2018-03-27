"use strict";
/**
 * Created by cwang on 3/26/18.
 * For debug
 * print the raw data of request
 *
 */


module.exports = {
    bodyParser: require('body-parser').raw({type:'*/* '}),

    rawDataPrinter: function (options) {
        var self = this;
        var isEnable = options.isEnable;
        console.log('request printer is ' + isEnable)
        return function (req, res, next) {
            if (isEnable) {
                console.log('request printer is ' + JSON.stringify(req.body))
            }
            next();
        }
    }
}