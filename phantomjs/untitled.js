var page = require('webpage').create();
var system = require('system');
require('./logTofile.js');
require('./jquery.min.js')
phantom.defaultPageSettings.webSecurityEnabled = false
    //console.toFile = "";
var args = system.args;
var url = args[1];
var fileName = args[2];
var word = args[3];
var mode = args[4];
var data = { etymaJson: "{}", result: "timeout" };
var hasTree = false;

page.settings.loadImages = false

url += word

function objStringate(obj) {
    var output = '';
    for (var property in obj) {
        console.log(output);
        output += property + ': ' + object[property] + '; ';
    }
    return output
}
page.captureContent = [/text/];
page.viewportSize = { width: 1524, height: 768 };
page.onLoadFinished = function() {
    console.log("onLoadFinished1")
}

page.onResourceRequested = function(requestData, networkRequest) {
    var matchNormal = requestData.url.match(/html/g) || requestData.url.match(/asp/g);
    var matchTree = requestData.url.match(/tree.swf/g);
    if (!(matchTree || matchNormal)) {
        console.log("cancel" + requestData.url)
        networkRequest.abort()
    } else if (matchTree) {
        hasTree = true;
    }

};


page.onResourceReceived = function(response) {
    if (response.url) {
        console.log('response  ' + response.url);
        if (response.url.includes("etymaJson") && response.body && response.body.indexOf(word) != -1) {
            console.log(response.body.indexOf(word) + "data:" + response.body);
            data.etymaJson = response.body;


            //  console.log(JSON.stringify(data))
            // page.render(fileName);
            // page.close();
            //      page.clearCookies();
            over('found')
        }
    }

};

page.onError = function(msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
};

console.log("open page: " + url)
page.open(url, function() {
    console.log("page opened: " + url)


    console.log("includeJs")
    console.log("word " + word);
    //console.log("page" + JSON.stringify(page))
    console.log("page " + page.framePlainText);
    if (page.framePlainText) {
        page.open("http://www.dicts.cn" + page.framePlainText, function() {
            console.log("page2 opened: ")
            if (hasTree) {
                window.setTimeout(function() {
                    over('timeout');
                }, 3000);
            } else {
                over('no_detail');
            }
        });
    } else {
        over('not_found');
    }
    //page.viewportSize = { width: 1024 , height: 768 };
    // page.clipRect = { top: 0, left: 0, width: page.viewportSize.width, height: page.viewportSize.height };

    //phantom.exit()

    // function objStringate(obj) {
    //     var output = '';
    //     for (var property in obj) {
    //         output += property + ': ' + object[property] + '; ';
    //     }
    //     return "output"
    // }



    // page.evaluate(function(foo1) {
    //     $("input#word").val(foo1)
    //     $("button#cigencizui-search").click()
    // }, word);



});

function over(result) {
    data.result = result
    console.toFile = "";
    console.log(JSON.stringify(data))
    phantom.exit();
}