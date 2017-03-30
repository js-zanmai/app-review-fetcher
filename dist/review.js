"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Review = function Review(id, date, title, content, rating, version, author) {
  _classCallCheck(this, Review);

  this.id = id;
  this.date = date;
  this.title = title;
  this.content = content;
  this.rating = rating;
  this.version = version;
  this.author = author;
};

exports.default = Review;