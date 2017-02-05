'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // for async/await


require('babel-polyfill');

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MailNotifier = function () {
  function MailNotifier(logger) {
    _classCallCheck(this, MailNotifier);

    this.logger = logger;
  }

  _createClass(MailNotifier, [{
    key: 'sendMailAsync',
    value: function sendMailAsync(subject, mailBody, mailConfig) {
      var smtpConfig, transporter, mailOptions;
      return regeneratorRuntime.async(function sendMailAsync$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              smtpConfig = {
                host: mailConfig.host,
                port: mailConfig.port
              };
              transporter = _nodemailer2.default.createTransport(smtpConfig);
              mailOptions = {
                from: mailConfig.fromAddress,
                to: mailConfig.toAddresses.join(', '),
                subject: subject,
                text: mailBody
              };


              this.logger.info('Start sending mail ' + subject);
              _context.next = 6;
              return regeneratorRuntime.awrap(transporter.sendMail(mailOptions));

            case 6:
              this.logger.info('Finished sending mail ' + subject);

            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'rating2star',
    value: function rating2star(rating) {
      return _ramda2.default.times(function (i) {
        return i < rating ? '★' : '☆';
      }, 5).reduce(function (a, b) {
        return a + b;
      });
    }
  }, {
    key: 'buildMessage',
    value: function buildMessage(reviewMap) {
      var _this = this;

      var mailBody = '';
      var LF = '\n';
      reviewMap.forEach(function (reviews, name) {
        mailBody += LF + '\u25A0' + name + LF + ('------------------------------' + LF);
        reviews.forEach(function (review) {
          mailBody += 'Date:    ' + review.date + LF + ('Title:   ' + review.title + LF) + ('Comment: ' + review.content + LF) + ('Author:  ' + review.author + LF) + ('Rating:  ' + _this.rating2star(review.rating) + LF) + ('Version: ' + review.version + LF + LF) + ('------------------------------' + LF);
        });
      });
      return mailBody;
    }
  }, {
    key: 'notifyAsync',
    value: function notifyAsync(reviewMap, subject, mailConfig) {
      var mailBody;
      return regeneratorRuntime.async(function notifyAsync$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (mailConfig.IsEnabled) {
                _context2.next = 3;
                break;
              }

              this.logger.info('mail option is disabled.');
              return _context2.abrupt('return');

            case 3:
              if (!(reviewMap.size === 0)) {
                _context2.next = 6;
                break;
              }

              this.logger.info('New review is nothing.');
              return _context2.abrupt('return');

            case 6:
              _context2.prev = 6;
              mailBody = this.buildMessage(reviewMap);

              this.logger.info('New arrivals!!! [subject] ' + subject + ' [body] ' + mailBody);
              _context2.next = 11;
              return regeneratorRuntime.awrap(this.sendMailAsync(subject, mailBody, mailConfig));

            case 11:
              _context2.next = 16;
              break;

            case 13:
              _context2.prev = 13;
              _context2.t0 = _context2['catch'](6);

              this.logger.error(_context2.t0);

            case 16:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this, [[6, 13]]);
    }
  }]);

  return MailNotifier;
}();

exports.default = MailNotifier;