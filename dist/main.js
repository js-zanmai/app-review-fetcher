'use strict';

require('babel-polyfill');

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _appReviewInfo = require('./app-review-info');

var _appReviewInfo2 = _interopRequireDefault(_appReviewInfo);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _utility = require('./utility');

var _utility2 = _interopRequireDefault(_utility);

var _platform = require('./platform');

var _platform2 = _interopRequireDefault(_platform);

var _scraper = require('./scraper');

var _scraper2 = _interopRequireDefault(_scraper);

var _excelGenerator = require('./excel-generator');

var _excelGenerator2 = _interopRequireDefault(_excelGenerator);

var _sqliteArchiver = require('./sqlite-archiver');

var _sqliteArchiver2 = _interopRequireDefault(_sqliteArchiver);

var _mailNotifier = require('./mail-notifier');

var _mailNotifier2 = _interopRequireDefault(_mailNotifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = _utility2.default.getLogger(); // for async/await


function scrapeAppReviewInfoListBody(appSettings, asyncFunc) {
  var appReviewInfoList, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, appSetting, reviews;

  return regeneratorRuntime.async(function scrapeAppReviewInfoListBody$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          appReviewInfoList = [];
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
          return regeneratorRuntime.awrap(asyncFunc(appSetting.id));

        case 10:
          reviews = _context.sent;

          logger.info(reviews.length + ' reviews fetched. [App name] ' + appSetting.name);
          appReviewInfoList.push(new _appReviewInfo2.default(appSetting.name, reviews));
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
          return _context.abrupt('return', appReviewInfoList);

        case 33:
        case 'end':
          return _context.stop();
      }
    }
  }, null, this, [[4, 20, 24, 32], [25,, 27, 31]]);
}

function scrapeAppReviewInfoList(platform) {
  var scraper;
  return regeneratorRuntime.async(function scrapeAppReviewInfoList$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          scraper = new _scraper2.default();

          if (!(platform === _platform2.default.APPSTORE)) {
            _context2.next = 7;
            break;
          }

          _context2.next = 4;
          return regeneratorRuntime.awrap(scrapeAppReviewInfoListBody(_config2.default.appStore, scraper.fetchReviewFromAppStore));

        case 4:
          return _context2.abrupt('return', _context2.sent);

        case 7:
          _context2.next = 9;
          return regeneratorRuntime.awrap(scrapeAppReviewInfoListBody(_config2.default.googlePlay, scraper.fetchReviewFromGooglePlay));

        case 9:
          return _context2.abrupt('return', _context2.sent);

        case 10:
        case 'end':
          return _context2.stop();
      }
    }
  }, null, this);
}

function executeAsync(platformType) {
  var appReviewInfoList, excelGenerator, sqliteArchiver, newAppReviewInfoList, mailNotifier;
  return regeneratorRuntime.async(function executeAsync$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(scrapeAppReviewInfoList(platformType));

        case 3:
          appReviewInfoList = _context3.sent;
          excelGenerator = new _excelGenerator2.default(logger);

          excelGenerator.generate(appReviewInfoList, platformType, __dirname + '/../out');

          sqliteArchiver = new _sqliteArchiver2.default(__dirname + '/../out/reviews.sqlite', logger);
          _context3.prev = 7;
          _context3.next = 10;
          return regeneratorRuntime.awrap(sqliteArchiver.archiveAsync(appReviewInfoList, platformType));

        case 10:
          newAppReviewInfoList = _context3.sent;

          if (!(_config2.default.mail.IsEnabled && !_ramda2.default.isEmpty(newAppReviewInfoList))) {
            _context3.next = 15;
            break;
          }

          mailNotifier = new _mailNotifier2.default(logger);
          _context3.next = 15;
          return regeneratorRuntime.awrap(mailNotifier.notifyAsync(newAppReviewInfoList, platformType));

        case 15:
          _context3.prev = 15;

          sqliteArchiver.close();
          return _context3.finish(15);

        case 18:
          _context3.next = 23;
          break;

        case 20:
          _context3.prev = 20;
          _context3.t0 = _context3['catch'](0);

          logger.error(_context3.t0);

        case 23:
        case 'end':
          return _context3.stop();
      }
    }
  }, null, this, [[0, 20], [7,, 15, 18]]);
}

function main() {
  return regeneratorRuntime.async(function main$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(executeAsync(_platform2.default.APPSTORE));

        case 2:
          _context4.next = 4;
          return regeneratorRuntime.awrap(executeAsync(_platform2.default.GOOGLEPLAY));

        case 4:
        case 'end':
          return _context4.stop();
      }
    }
  }, null, this);
}

main();