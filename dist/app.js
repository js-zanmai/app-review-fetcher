'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-polyfill');

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _utility = require('./utility');

var _utility2 = _interopRequireDefault(_utility);

var _scraper = require('./scraper');

var _excelGenerator = require('./excel-generator');

var _excelGenerator2 = _interopRequireDefault(_excelGenerator);

var _sqliteArchiver = require('./sqlite-archiver');

var _sqliteArchiver2 = _interopRequireDefault(_sqliteArchiver);

var _mailNotifier = require('./mail-notifier');

var _mailNotifier2 = _interopRequireDefault(_mailNotifier);

var _slackNotifier = require('./slack-notifier');

var _slackNotifier2 = _interopRequireDefault(_slackNotifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } // for async/await


var Platform = {
  IOS: Symbol(),
  ANDROID: Symbol()
};

var AppKind = function AppKind(service, platform) {
  _classCallCheck(this, AppKind);

  this.service = service;
  this.platform = platform;
};

var Application = function () {
  function Application() {
    var logger = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _utility2.default.getLogger();
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _jsYaml2.default.safeLoad(_fs2.default.readFileSync(__dirname + '/../config.yml', 'utf8'));
    var excel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new _excelGenerator2.default(logger);
    var sqlite = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new _sqliteArchiver2.default(config.sqlite.dbPath, logger);
    var mail = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : new _mailNotifier2.default(logger);
    var slack = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new _slackNotifier2.default(logger);
    var appStore = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : new _scraper.AppStoreScraper(logger);
    var googlePlay = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : new _scraper.GooglePlayScraper(logger);

    _classCallCheck(this, Application);

    this.logger = logger;
    this.config = config;
    this.mail = mail;
    this.excel = excel;
    this.sqlite = sqlite;
    this.slack = slack;
    this.appStore = appStore;
    this.googlePlay = googlePlay;
  }

  _createClass(Application, [{
    key: 'fetchAsyncBody',
    value: function fetchAsyncBody(appSettings, scraper) {
      var reviewMap, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, appSetting, reviews;

      return regeneratorRuntime.async(function fetchAsyncBody$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              reviewMap = new Map();
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context.prev = 4;
              _iterator = appSettings[Symbol.iterator]();

            case 6:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context.next = 18;
                break;
              }

              appSetting = _step.value;
              _context.next = 10;
              return regeneratorRuntime.awrap(scraper.fetchAsync(appSetting.id));

            case 10:
              reviews = _context.sent;

              this.logger.info(reviews.length + ' reviews fetched. [App name] ' + appSetting.name);
              reviewMap.set(appSetting.name, reviews);
              _context.next = 15;
              return regeneratorRuntime.awrap(_utility2.default.sleep());

            case 15:
              _iteratorNormalCompletion = true;
              _context.next = 6;
              break;

            case 18:
              _context.next = 24;
              break;

            case 20:
              _context.prev = 20;
              _context.t0 = _context['catch'](4);
              _didIteratorError = true;
              _iteratorError = _context.t0;

            case 24:
              _context.prev = 24;
              _context.prev = 25;

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }

            case 27:
              _context.prev = 27;

              if (!_didIteratorError) {
                _context.next = 30;
                break;
              }

              throw _iteratorError;

            case 30:
              return _context.finish(27);

            case 31:
              return _context.finish(24);

            case 32:
              return _context.abrupt('return', reviewMap);

            case 33:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this, [[4, 20, 24, 32], [25,, 27, 31]]);
    }
  }, {
    key: 'fetchAsync',
    value: function fetchAsync(platform) {
      return regeneratorRuntime.async(function fetchAsync$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.t0 = platform;
              _context2.next = _context2.t0 === Platform.IOS ? 3 : _context2.t0 === Platform.ANDROID ? 6 : 9;
              break;

            case 3:
              _context2.next = 5;
              return regeneratorRuntime.awrap(this.fetchAsyncBody(this.config.appStore, this.appStore));

            case 5:
              return _context2.abrupt('return', _context2.sent);

            case 6:
              _context2.next = 8;
              return regeneratorRuntime.awrap(this.fetchAsyncBody(this.config.googlePlay, this.googlePlay));

            case 8:
              return _context2.abrupt('return', _context2.sent);

            case 9:
              throw new Error('invalid platform!!');

            case 10:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'getKind',
    value: function getKind(platform) {
      switch (platform) {
        case Platform.IOS:
          return new AppKind('AppStore', 'iOS');
        case Platform.ANDROID:
          return new AppKind('GooglePlay', 'Android');
        default:
          throw new Error('invalid platform!!');
      }
    }
  }, {
    key: 'runAsync',
    value: function runAsync(platform) {
      var reviewMap, kind, newReviewMap;
      return regeneratorRuntime.async(function runAsync$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(this.fetchAsync(platform));

            case 2:
              reviewMap = _context3.sent;
              kind = this.getKind(platform);

              this.excel.generate(reviewMap, this.config.excel.outDir, kind.service + 'Reviews');
              _context3.next = 7;
              return regeneratorRuntime.awrap(this.sqlite.archiveAsync(reviewMap, kind.service.toLowerCase()));

            case 7:
              newReviewMap = _context3.sent;
              _context3.next = 10;
              return regeneratorRuntime.awrap(this.mail.notifyAsync(newReviewMap, kind.service, this.config.mail));

            case 10:
              this.slack.notify(newReviewMap, platform, this.config.slack);

            case 11:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'main',
    value: function main() {
      return regeneratorRuntime.async(function main$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return regeneratorRuntime.awrap(this.runAsync(Platform.IOS));

            case 3:
              _context4.next = 5;
              return regeneratorRuntime.awrap(this.runAsync(Platform.ANDROID));

            case 5:
              _context4.next = 10;
              break;

            case 7:
              _context4.prev = 7;
              _context4.t0 = _context4['catch'](0);

              this.logger.error(_context4.t0);

            case 10:
              _context4.prev = 10;

              this.sqlite.close();
              return _context4.finish(10);

            case 13:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this, [[0, 7, 10, 13]]);
    }
  }]);

  return Application;
}();

module.exports = Application; // for ES5