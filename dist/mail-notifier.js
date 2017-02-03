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

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _platform = require('./platform');

var _platform2 = _interopRequireDefault(_platform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MailNotifier = function () {
  function MailNotifier(logger) {
    _classCallCheck(this, MailNotifier);

    this.logger = logger;
  }

  _createClass(MailNotifier, [{
    key: 'sendMailAsync',
    value: function sendMailAsync(subject, mailBody) {
      var smtpConfig, transporter, mailOptions;
      return regeneratorRuntime.async(function sendMailAsync$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              smtpConfig = {
                host: _config2.default.mail.host,
                port: _config2.default.mail.port
              };
              transporter = _nodemailer2.default.createTransport(smtpConfig);
              mailOptions = {
                from: _config2.default.mail.fromAddress,
                to: _config2.default.mail.toAddress.join(', '),
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
    key: 'notifyAsync',
    value: function notifyAsync(reviewMap, platform) {
      var _this = this;

      return regeneratorRuntime.async(function notifyAsync$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!_ramda2.default.isEmpty(reviewMap)) {
                _context3.next = 3;
                break;
              }

              this.logger.info('New review is nothing');
              return _context3.abrupt('return');

            case 3:
              _context3.prev = 3;
              _context3.next = 6;
              return regeneratorRuntime.awrap(function _callee() {
                var mailBody, LF, mailSubject;
                return regeneratorRuntime.async(function _callee$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        mailBody = '';
                        LF = '\n';
                        mailSubject = platform === _platform2.default.APPSTORE ? '【AppStore新着レビュー】' : '【GooglePlay新着レビュー】';


                        reviewMap.forEach(function (reviews, name) {
                          mailBody += LF + '\u25A0' + name + LF + ('------------------------------' + LF);
                          reviews.forEach(function (review) {
                            mailBody += 'Date:    ' + review.date + LF + ('Title:   ' + review.title + LF) + ('Comment: ' + review.content + LF) + ('Author:  ' + review.author + LF) + ('Rating:  ' + _this.rating2star(review.rating) + LF) + ('Version: ' + review.version + LF + LF) + ('------------------------------' + LF);
                          });
                        });

                        _this.logger.info('New arrivals!!! [subject] ' + mailSubject + ' [body] ' + mailBody);
                        _context2.next = 7;
                        return regeneratorRuntime.awrap(_this.sendMailAsync(mailSubject, mailBody));

                      case 7:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, null, _this);
              }());

            case 6:
              _context3.next = 11;
              break;

            case 8:
              _context3.prev = 8;
              _context3.t0 = _context3['catch'](3);

              this.logger.error(_context3.t0);

            case 11:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this, [[3, 8]]);
    }
  }]);

  return MailNotifier;
}();

exports.default = MailNotifier;