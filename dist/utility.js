'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _log4js = require('log4js');

var _log4js2 = _interopRequireDefault(_log4js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utility = function () {
  function Utility() {
    _classCallCheck(this, Utility);
  }

  _createClass(Utility, null, [{
    key: 'zeroPadding',
    value: function zeroPadding(number) {
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

      return (Array(length).join('0') + number).slice(-length);
    }
  }, {
    key: 'getLogger',
    value: function getLogger() {
      _log4js2.default.configure(__dirname + '/../log4js.json');
      return _log4js2.default.getLogger('default');
    }
  }, {
    key: 'sleep',
    value: function sleep() {
      var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

      return new Promise(function (resolve) {
        setTimeout(resolve, ms);
      });
    }

    // 稀に古いレビューが返ってくることがあったため、直近３日以内のレビューを新着レビューと判定する。

  }, {
    key: 'filterRecentReviews',
    value: function filterRecentReviews(reviews) {
      var now = new Date();
      var threeDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
      return reviews.filter(function (review) {
        var date = new Date(review.date);
        return date.getTime() >= threeDaysAgo.getTime();
      });
    }
  }]);

  return Utility;
}();

exports.default = Utility;