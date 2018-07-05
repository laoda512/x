require('./logTofile.js');
var page = require('webpage').create();

page.captureContent = [ /json/ ];

page.onResourceRequested = function(requestData, networkRequest) {
    //console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
};
page.onResourceReceived = function(response) {
	if (response.url.includes("article") && response.body ) {
    	console.log('Response (#' + response.id + ', body "' + unicodeToChar(response.body) + '"): ' + JSON.stringify(response));
    }
};

function unicodeToChar(text) {
   return text.replace(/\\u[\dA-F]{4}/gi, 
          function (match) {
               return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
          });
}

page.open("https://www.toutiao.com/c/user/98010297733/#mid=1599809447113732", function (status) {
    page.viewportSize = { width:1024, height:768 };
    page.scrollPosition = { top: 500, left: 0 };
    count = 500
     window.setInterval(function() {
      // Checks if there is a div with class=".has-more-items" 
      // (not sure if this is the best way of doing it)
      count+=100
		page.scrollPosition = { top: count, left: 0 };
		page.render('screenshot'+count+'.png')
 	 }, 300);
    

     
});