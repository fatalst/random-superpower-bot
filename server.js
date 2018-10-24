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
    var text = $('#mw-content-text').children('p').text().split("");
    var finalText = text[0];
    var i = 1;
    while(i < 100 && text[i] != "."){
    	finalText += text[i];
    	i++;
    }
    finalText += ".";
    var title = $('.page-header__title').text();
    console.log(title + ": " + finalText + " (" + 'http://powerlisting.wikia.com/wiki/' + title.replace(/ /g, "_") + ")");
  })
  .catch((err) => {
    console.log(err);
  });
