(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.module = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
const fetch = require("node-fetch");

class Flickr {
 async search(query) {
  let endpoint = "https://api.flickr.com/services/rest";
  let method = "method=flickr.photos.search";
  let key = "73dcc158504f1a4c3c95203a1b55e235";
  let format = "format=json&nojsoncallback=1";
  let size = "40";
  let text = encodeURIComponent(query);
  let api = `${endpoint}/?${method}&api_key=${key}&text=${text}&${format}&per_page=${size}&sort=relevance`;

  let result = await fetch(api);
  let data = await result.json();
  // console.log(JSON.stringify(data, undefined, 2));
  return data.photos.photo.map(photo => {
    let url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;                    
    return url;
   });
 }
}

module.exports = {
 Flickr: Flickr
};

},{"node-fetch":2}],2:[function(require,module,exports){
"use strict";

module.exports = exports = self.fetch;

// Needed for TypeScript and Webpack.
exports.default = self.fetch.bind(self);

exports.Headers = self.Headers;
exports.Request = self.Request;
exports.Response = self.Response;

},{}]},{},[1])(1)
});
