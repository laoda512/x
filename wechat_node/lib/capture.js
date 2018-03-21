var fs = require('fs');

var log_file = fs.createWriteStream('../reslut/debug.log', {
    encoding: 'utf8'
});
var log_stdout = process.stdout;

exports.log = function(d) { //
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};;
exports.log('count: %d', count);