'use strict';

require('babel-polyfill');

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _utility = require('./utility');

var _utility2 = _interopRequireDefault(_utility);

var _scraper = require('./scraper');

var _excelGenerator = require('./excel-generator');

var _excelGenerator2 = _interopRequireDefault(_excelGenerator);

var _sqliteArchiver = require('./sqlite-archiver');

var _sqliteArchiver2 = _interopRequireDefault(_sqliteArchiver);

var _mailNotifier = require('./mail-notifier');

var _mailNotifier2 = _interopRequireDefault(_mailNotifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } // for async/await


var logger = _utility2.default.getLogger();
var outDir = __dirname + '/../out';
var dbFile = outDir + '/reviews.sqlite';

var Platform = {
  APPSTORE: Symbol(),
  GOOGLEPLAY: Symbol()
};

var Param = function Param(mailSubject, tableName, fileNameWithoutExtension) {
  _classCallCheck(this, Param);

  this.mailSubject = mailSubject;
  this.tableName = tableName;
  this.fileNameWithoutExtension = fileNameWithoutExtension;
};

function fetchAsyncBody(appSettings, scraper) {
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

          logger.info(reviews.length + ' reviews fetched. [App name] ' + appSetting.name);
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

function fetchAsync(platform) {
  return regeneratorRuntime.async(function fetchAsync$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.t0 = platform;
          _context2.next = _context2.t0 === Platform.APPSTORE ? 3 : _context2.t0 === Platform.GOOGLEPLAY ? 6 : 9;
          break;

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(fetchAsyncBody(_config2.default.appStore, new _scraper.AppStoreScraper(logger)));

        case 5:
          return _context2.abrupt('return', _context2.sent);

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(fetchAsyncBody(_config2.default.googlePlay, new _scraper.GooglePlayScraper(logger)));

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

function map2Excel(reviewMap, fileNameWithoutExtension) {
  var excel = new _excelGenerator2.default(logger);
  excel.generate(reviewMap, outDir, fileNameWithoutExtension);
}

function map2SqliteAsync(reviewMap, tableName) {
  var sqlite;
  return regeneratorRuntime.async(function map2SqliteAsync$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          sqlite = new _sqliteArchiver2.default(dbFile, logger);
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(sqlite.archiveAsync(reviewMap, tableName));

        case 4:
          return _context3.abrupt('return', _context3.sent);

        case 5:
          _context3.prev = 5;

          sqlite.close();
          return _context3.finish(5);

        case 8:
        case 'end':
          return _context3.stop();
      }
    }
  }, null, this, [[1,, 5, 8]]);
}

function map2MailAsync(reviewMap, mailSubject) {
  var mail;
  return regeneratorRuntime.async(function map2MailAsync$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          mail = new _mailNotifier2.default(logger);
          _context4.next = 3;
          return regeneratorRuntime.awrap(mail.notifyAsync(reviewMap, mailSubject));

        case 3:
        case 'end':
          return _context4.stop();
      }
    }
  }, null, this);
}

function getParams(platform) {
  switch (platform) {
    case Platform.APPSTORE:
      return new Param('【AppStore新着レビュー】', 'appstore', 'AppStoreReviews');
    case Platform.GOOGLEPLAY:
      return new Param('【GooglePlay新着レビュー】', 'googleplay', 'GooglePlayReviews');
    default:
      throw new Error('invalid platform!!');
  }
}

function runAsync(platform) {
  var reviewMap, param, newReviewMap;
  return regeneratorRuntime.async(function runAsync$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(fetchAsync(platform));

        case 3:
          reviewMap = _context5.sent;
          param = getParams(platform);

          map2Excel(reviewMap, param.fileNameWithoutExtension);
          _context5.next = 8;
          return regeneratorRuntime.awrap(map2SqliteAsync(reviewMap, param.tableName));

        case 8:
          newReviewMap = _context5.sent;

          if (!_config2.default.mail.IsEnabled) {
            _context5.next = 12;
            break;
          }

          _context5.next = 12;
          return regeneratorRuntime.awrap(map2MailAsync(newReviewMap, param.mailSubject));

        case 12:
          _context5.next = 17;
          break;

        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5['catch'](0);

          logger.error(_context5.t0);

        case 17:
        case 'end':
          return _context5.stop();
      }
    }
  }, null, this, [[0, 14]]);
}

function main() {
  return regeneratorRuntime.async(function main$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(runAsync(Platform.APPSTORE));

        case 2:
          _context6.next = 4;
          return regeneratorRuntime.awrap(runAsync(Platform.GOOGLEPLAY));

        case 4:
        case 'end':
          return _context6.stop();
      }
    }
  }, null, this);
}

main();