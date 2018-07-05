'use strict'

exports = module.exports = function(err, message, nullableCallback){
    if(err){
        console.log(err);
    }else{
        console.log(message);
    }
    typeof callback === 'function' && callback();
};