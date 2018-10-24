/* Setting things up. */
var path = require('path'),
    fs = require('fs'),
    express = require('express'),
    app = express(),
    rp = require('request-promise'),
    storage = require('node-persist'),
    cheerio = require('cheerio'),
    Twit = require('twit'),
    twit;

  try {
    twit = new Twit({
      consumer_key:         process.env.CONSUMER_KEY,
      consumer_secret:      process.env.CONSUMER_SECRET,
      access_token:         process.env.ACCESS_TOKEN,
      access_token_secret:  process.env.ACCESS_TOKEN_SECRET
    });
    console.log("Ready to tweet! Send a GET or POST request to {GLITCH_PROJECT_URL}/tweet");
  } catch(err) {
    console.error(err);
    console.error("Sorry, your .env file does not have the correct settings in order to tweet");
  }

storage.initSync();
app.use(express.static('public'));

/* You can use uptimerobot.com or a similar site to hit your /BOT_ENDPOINT to wake up your app and make your Twitter bot tweet. */

var allText = "";
  
const options = {
  uri: `http://powerlisting.wikia.com/wiki/Special:Random`,
  transform: function (body) {
    return cheerio.load(body);
  }
};

rp(options)
  .then(($) => {
    var text = $('#mw-content-text').children('p').text().split("");
    var finalText = text[0];
    var i = 1;
    while(i < 100 && text[i] != "."){
      finalText += text[i];
      i++;
    }
    finalText += ".";
    var title = $('.page-header__title').text();
    allText = (title + ": " + finalText + " (" + 'http://powerlisting.wikia.com/wiki/' + title.replace(/ /g, "_") + ")");
  })
  .catch((err) => {
    console.log(err);
  });

function postTweet(){
  console.log("Tweeting!");
  twit.post('statuses/update', { status: allText }, function(err, data, response) {
    console.log(`Posted status: ` + allText);
  });
}

app.all("/" + process.env.BOT_ENDPOINT, function (request, response) {
  var now = Date.now(), // time since epoch in millisecond
      lastRun = storage.getItemSync("lastRun") || 0, // last time we were run in milliseconds
      postDelay = process.env.POST_DELAY_IN_MINUTES || 60;// time to delay between tweets in minutes

  if (now - lastRun <= (1000 * 60 * postDelay)) { // Only post every process.env.POST_DELAY_IN_MINUTES or 60 minutes
    console.error(`It's too soon, we only post every ${postDelay} minutes. It's only been ${ Math.floor((now - lastRun) / 60 / 1000 ) } minutes`);
    return false;
  }
  
  storage.setItemSync("lastRun", now);
  var resp = response;
  postTweet();
  return true;
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});