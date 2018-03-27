"use strict";
/**
 * Created by cwang on 3/26/18.
 * For debug
 * Return a fake response for every response
 *
 */


module.exports = function (options) {
    var self = this;
    var isEnable = options.isEnable;
    console.log('fake response is '+isEnable)
    return function (req, res, next) {
        if (isEnable) {
            res.send('fake response')
        } else {
            next();
        }
    }
};