var fs = require('fs'),
    path = require('path'),
    // Twit = require('twit'),
    rp = require('request-promise'),
    cheerio = require('cheerio');

const options = {
  uri: `http://powerlisting.wikia.com/wiki/Special:Random`,
  transform: function (body) {
    return cheerio.load(body);
  }
};

rp(options)
  .then(($) => {
  	var title = $('.page-header__title').text();
    console.log(title);
    var text = $('#mw-content-text').children('p').text().split("");
    var finalText = text[0];
    var i = 1;
    while(i < 100){
    	finalText += text[i];
    	i++;
    }
    console.log(finalText);
    console.log('http://powerlisting.wikia.com/wiki/' + title);
  })
  .catch((err) => {
    console.log(err);
  });
