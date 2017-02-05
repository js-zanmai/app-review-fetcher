'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slackNode = require('slack-node');

var _slackNode2 = _interopRequireDefault(_slackNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Field = function Field(title, value) {
  var short = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  _classCallCheck(this, Field);

  this.title = title;
  this.value = value;
  this.short = short;
};

var Attachment = function Attachment(pretext, color, fields) {
  _classCallCheck(this, Attachment);

  this.fallback = pretext; // pretextと同じにする
  this.pretext = pretext;
  this.color = color;
  this.fields = fields;
};

var SlackNotifier = function () {
  function SlackNotifier(logger) {
    var slack = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new _slackNode2.default();

    _classCallCheck(this, SlackNotifier);

    this.logger = logger;
    this.slack = slack;
  }

  _createClass(SlackNotifier, [{
    key: 'notify',
    value: function notify(reviewMap, platform, slackConfig) {
      var _this = this;

      if (!slackConfig.use) {
        this.logger.info('slack option is disabled.');
        return;
      }

      if (reviewMap.size === 0) {
        this.logger.info('SlackNotifier New review is nothing.');
        return;
      }

      try {
        reviewMap.forEach(function (reviews, appName) {
          reviews.forEach(function (review) {
            var attachments = _this.buildAttachments(appName, review, platform);
            _this.webhook(attachments, slackConfig);
          });
        });
      } catch (err) {
        this.logger.error(err);
      }
    }
  }, {
    key: 'webhook',
    value: function webhook(attachments, slackConfig) {
      var _this2 = this;

      this.slack.setWebhook(slackConfig.webhook);
      this.slack.webhook({
        'channel': '#' + slackConfig.channel,
        'username': 'app-review-bot',
        'icon_emoji': ':japanese_goblin:',
        'attachments': attachments
      }, function (err, response) {
        if (err !== null || response.statusCode !== 200) {
          _this2.logger.error(err);
          _this2.logger.error(response);
        }
      });
    }
  }, {
    key: 'buildAttachments',
    value: function buildAttachments(appName, review, platform) {
      return [new Attachment('\u300C' + appName + '\u300D\u306E\u65B0\u7740\u30EC\u30D3\u30E5\u30FC', this.selectColor(review.rating), this.buildFields(review, platform))];
    }
  }, {
    key: 'buildFields',
    value: function buildFields(review, platform) {
      return [new Field(review.title, review.content, false), new Field('Rating', this.buildStar(review.rating)), new Field('Updated', review.date), new Field('Platform', platform), new Field('Version', review.version)];
    }
  }, {
    key: 'buildStar',
    value: function buildStar(rating) {
      return Array(Number(rating) + 1).join(':star:');
    }
  }, {
    key: 'selectColor',
    value: function selectColor(rating) {
      switch (Number(rating)) {
        case 1:
          return '#990000';
        case 2:
          return '#EFA131';
        case 3:
          return '#999900';
        case 4:
          return '#66CC00';
        case 5:
          return '#16A085';
        default:
          throw new Error('invalid rating!!');
      }
    }
  }]);

  return SlackNotifier;
}();

exports.default = SlackNotifier;