'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // for async/await


require('babel-polyfill');

var _sqlite = require('sqlite3');

var _sqlite2 = _interopRequireDefault(_sqlite);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _platform = require('./platform');

var _platform2 = _interopRequireDefault(_platform);

var _appReviewInfo = require('./app-review-info');

var _appReviewInfo2 = _interopRequireDefault(_appReviewInfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SqliteArchiver = function () {
  function SqliteArchiver(dbPath, logger) {
    _classCallCheck(this, SqliteArchiver);

    var sqlite3Client = _sqlite2.default.verbose();
    this.db = new sqlite3Client.Database(dbPath);
    this.logger = logger;
  }

  _createClass(SqliteArchiver, [{
    key: 'initTableIfNotExists',
    value: function initTableIfNotExists(tableName) {
      var _this = this;

      this.db.serialize(function () {
        _this.db.run('CREATE TABLE IF NOT EXISTS ' + tableName + '(' + 'app_name TEXT, ' + 'title TEXT, ' + 'content TEXT, ' + 'author TEXT, ' + 'rating INTEGER, ' + 'date TEXT, ' + 'version TEXT)');
      });
    }
  }, {
    key: 'selectAllReviewAsync',
    value: function selectAllReviewAsync(appName, tableName) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.db.serialize(function () {
          _this2.db.all('SELECT * FROM ' + tableName + ' WHERE app_name = $appName', { $appName: appName }, function (err, res) {
            if (err) {
              _this2.logger.error(err);
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      });
    }
  }, {
    key: 'insertReviews',
    value: function insertReviews(reviews, appName, tableName) {
      var _this3 = this;

      this.db.serialize(function () {
        var query = 'INSERT INTO ' + tableName + '(app_name, title, content, author, rating, date, version) VALUES(?, ?, ?, ?, ?, ?, ?)';
        var stmt = _this3.db.prepare(query);
        reviews.forEach(function (x) {
          return stmt.run(appName, x.title, x.content, x.author, parseInt(x.rating, 10), x.date, x.version);
        });
        stmt.finalize();
      });
    }

    // 稀に古いレビューが返ってくることがあったため、DBに存在していない、かつ、直近３日以内のレビューを新着レビューと判定する。

  }, {
    key: 'extractRecentReviews',
    value: function extractRecentReviews(reviews) {
      var now = new Date();
      var threeDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
      return reviews.filter(function (review) {
        return new Date(review.date).getTime() >= threeDaysAgo.getTime();
      });
    }
  }, {
    key: 'archiveAsync',
    value: function archiveAsync(appReviewInfoList, platformType) {
      var _this4 = this;

      var tableName, newAppReviewInfoList, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step;

      return regeneratorRuntime.async(function archiveAsync$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(this.db.run('BEGIN'));

            case 2:
              _context2.prev = 2;
              tableName = platformType === _platform2.default.APPSTORE ? 'appstore' : 'googleplay';

              this.initTableIfNotExists(tableName);

              newAppReviewInfoList = [];
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context2.prev = 9;

              _loop = function _callee() {
                var appReviewInfo, savedReviews, isSameReview, curriedIsSameReview, isNewReview, newReviews, recentReviews;
                return regeneratorRuntime.async(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        appReviewInfo = _step.value;
                        _context.next = 3;
                        return regeneratorRuntime.awrap(_this4.selectAllReviewAsync(appReviewInfo.name, tableName));

                      case 3:
                        savedReviews = _context.sent;

                        isSameReview = function isSameReview(saved, review) {
                          return review.date === saved.date && review.title === saved.title && review.author === saved.author;
                        };

                        curriedIsSameReview = _ramda2.default.curry(isSameReview);

                        isNewReview = function isNewReview(x) {
                          return !_ramda2.default.any(curriedIsSameReview(x))(savedReviews);
                        };

                        newReviews = _ramda2.default.filter(isNewReview, appReviewInfo.reviews);


                        if (_ramda2.default.isEmpty(newReviews)) {
                          _this4.logger.info('New review is nothing. [Table Name] ' + tableName + ' [App name] ' + appReviewInfo.name);
                        } else {
                          _this4.insertReviews(newReviews, appReviewInfo.name, tableName);
                          recentReviews = _this4.extractRecentReviews(newReviews);

                          if (!_ramda2.default.isEmpty(recentReviews)) {
                            newAppReviewInfoList.push(new _appReviewInfo2.default(appReviewInfo.name, recentReviews));
                          }
                          _this4.logger.info('Inserted ' + newReviews.length + ' number of reviews. [Table Name] ' + tableName + ' [App name] ' + appReviewInfo.name);
                        }

                      case 9:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, null, _this4);
              };

              _iterator = appReviewInfoList[Symbol.iterator]();

            case 12:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context2.next = 18;
                break;
              }

              _context2.next = 15;
              return regeneratorRuntime.awrap(_loop());

            case 15:
              _iteratorNormalCompletion = true;
              _context2.next = 12;
              break;

            case 18:
              _context2.next = 24;
              break;

            case 20:
              _context2.prev = 20;
              _context2.t0 = _context2['catch'](9);
              _didIteratorError = true;
              _iteratorError = _context2.t0;

            case 24:
              _context2.prev = 24;
              _context2.prev = 25;

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }

            case 27:
              _context2.prev = 27;

              if (!_didIteratorError) {
                _context2.next = 30;
                break;
              }

              throw _iteratorError;

            case 30:
              return _context2.finish(27);

            case 31:
              return _context2.finish(24);

            case 32:
              _context2.next = 34;
              return regeneratorRuntime.awrap(this.db.run('COMMIT'));

            case 34:
              return _context2.abrupt('return', newAppReviewInfoList);

            case 37:
              _context2.prev = 37;
              _context2.t1 = _context2['catch'](2);
              _context2.next = 41;
              return regeneratorRuntime.awrap(this.db.run('ROLLBACK'));

            case 41:
              this.logger.error(_context2.t1);

            case 42:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this, [[2, 37], [9, 20, 24, 32], [25,, 27, 31]]);
    }
  }, {
    key: 'close',
    value: function close() {
      this.db.close();
    }
  }]);

  return SqliteArchiver;
}();

exports.default = SqliteArchiver;