/**
 * 百度翻译的 API 支持
 *
 * http://dwz.cn/bau5M
 * 
 * jshint strict:true
 */
var sugar = require('sugar');
var $ = require('jquery');
var utils = require('../lib/utils');

// TODO: Auth detect word
var WORD_URL = 'http://dict.baidu.com/s?wd=';
var PHRASE_URL = 'http://openapi.baidu.com/public/2.0/bmt/translate?client_id=hXxOZlP7bsOYFS6EFRmGTOe5&from=en&to=zh&q=';

var SEL_WORD = '.en-simple-means';
var SEL_WORD_MEANS = '.en-simple-means .en-content > div > p';
var SEL_WORD_PHONETIC = '.pronounce [lang="EN-US"]:last';

function formatWord(result) {
  var $result = $(result);

  if (!$result.find(SEL_WORD).length) return null;

  var response = {};
  
  var $phonetic = $result.find(SEL_WORD_PHONETIC);
  if ($phonetic.length) {
    response.phonetic = $phonetic.text()
  }
  
  var $means = $result.find(SEL_WORD_MEANS);
  response.translation = $means.map(function() {
    return $(this).text();
  }).toArray().join('<br />')

  return response;
}

function formatPhrase(result) {
  if (!result) return null;

  var response = {};
  var trans_result = result.trans_result[0];

  if (trans_result.src == trans_result.dst) return null;

  response.translation = trans_result.dst;

  return response;
}

function requestWord(text, callback) {
  var request = $.get(WORD_URL + encodeURIComponent(text));

  request.done(function(html) {
    callback(formatWord(utils.sanitizeHTML(html)));
  });

  request.fail(function() {
    // TODO: Raise Error instead
    callback(null);
  });
}

function requestPhrase(text, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4) {
      var result = JSON.parse(this.responseText);
      callback(formatPhrase(result));
    }
  };
  xhr.open('GET', PHRASE_URL + encodeURIComponent(text), true);
  xhr.send();
}

var BaiduTranslator = { name: 'baidu' };

BaiduTranslator.translate = function(text, callback) {
  if (/^\s*$/.test(text)) {
    callback(null);
  } else if (/^[a-zA-Z]+$/.test(text)) {
    requestWord(text, callback);
  } else {
    requestPhrase(text, callback);
  }
};

module.exports = BaiduTranslator;