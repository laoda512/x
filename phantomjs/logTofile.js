// var fs = require('fs');

// var log_file = fs.createWriteStream('../reslut/debug.log', {
//     encoding: 'utf8'
// });
// var log_stdout = process.stdout;

// exports.log = function(d) { //
//     log_file.write(util.format(d) + '\n');
//     log_stdout.write(util.format(d) + '\n');
// };;
// exports.log('count: %d', count);

Object.defineProperty(console, "toFile", {
    get: function() {
        return console.__file__;
    },
    set: function(val) {
        if (!console.__file__ && val) {
            console.__log__ = console.log;
            console.log = function() {

                var fs = require('fs');
                var msg = '';
                for (var i = 0; i < arguments.length; i++) {
                    msg += ((i === 0) ? '' : ' ') + arguments[i];
                }
                if (msg) {
                    fs.write(console.__file__, msg + '\r\n', 'a');
                }
                //console.__log__(msg)

            };
        } else if (console.__file__ && !val) {
            console.log = console.__log__;
        }
        console.__file__ = val;
    }
});

console.toFile = '/phantomjs/script/result/test.js'