'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // for async/await


require('babel-polyfill');

var _sqlite = require('sqlite3');

var _sqlite2 = _interopRequireDefault(_sqlite);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

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
        var date = new Date(review.date);
        return date.getTime() >= threeDaysAgo.getTime();
      });
    }
  }, {
    key: 'searchNewReviewsAsync',
    value: function searchNewReviewsAsync(reviews, appName, tableName) {
      var savedReviews, isSameReview, curriedIsSameReview, isNewReview;
      return regeneratorRuntime.async(function searchNewReviewsAsync$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(this.selectAllReviewAsync(appName, tableName));

            case 2:
              savedReviews = _context.sent;

              isSameReview = function isSameReview(saved, review) {
                return review.date === saved.date && review.title === saved.title && review.author === saved.author;
              };

              curriedIsSameReview = _ramda2.default.curry(isSameReview);

              isNewReview = function isNewReview(x) {
                return !_ramda2.default.any(curriedIsSameReview(x))(savedReviews);
              };

              return _context.abrupt('return', _ramda2.default.filter(isNewReview, reviews));

            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'archiveAsync',
    value: function archiveAsync(reviewMap, tableName) {
      var newReviewMap, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step$value, appName, reviews, newReviews, recentReviews;

      return regeneratorRuntime.async(function archiveAsync$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(this.db.run('BEGIN'));

            case 2:
              _context2.prev = 2;

              this.initTableIfNotExists(tableName);
              newReviewMap = new Map();
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context2.prev = 8;
              _iterator = reviewMap.entries()[Symbol.iterator]();

            case 10:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context2.next = 19;
                break;
              }

              _step$value = _slicedToArray(_step.value, 2), appName = _step$value[0], reviews = _step$value[1];
              _context2.next = 14;
              return regeneratorRuntime.awrap(this.searchNewReviewsAsync(reviews, appName, tableName));

            case 14:
              newReviews = _context2.sent;


              if (_ramda2.default.isEmpty(newReviews)) {
                this.logger.info('New review is nothing. [Table Name] ' + tableName + ' [App name] ' + appName);
              } else {
                this.insertReviews(newReviews, appName, tableName);
                recentReviews = this.extractRecentReviews(newReviews);

                if (!_ramda2.default.isEmpty(recentReviews)) {
                  newReviewMap.set(appName, recentReviews);
                }
                this.logger.info('Inserted ' + newReviews.length + ' number of reviews. [Table Name] ' + tableName + ' [App name] ' + appName);
              }

            case 16:
              _iteratorNormalCompletion = true;
              _context2.next = 10;
              break;

            case 19:
              _context2.next = 25;
              break;

            case 21:
              _context2.prev = 21;
              _context2.t0 = _context2['catch'](8);
              _didIteratorError = true;
              _iteratorError = _context2.t0;

            case 25:
              _context2.prev = 25;
              _context2.prev = 26;

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }

            case 28:
              _context2.prev = 28;

              if (!_didIteratorError) {
                _context2.next = 31;
                break;
              }

              throw _iteratorError;

            case 31:
              return _context2.finish(28);

            case 32:
              return _context2.finish(25);

            case 33:
              _context2.next = 35;
              return regeneratorRuntime.awrap(this.db.run('COMMIT'));

            case 35:
              return _context2.abrupt('return', newReviewMap);

            case 38:
              _context2.prev = 38;
              _context2.t1 = _context2['catch'](2);
              _context2.next = 42;
              return regeneratorRuntime.awrap(this.db.run('ROLLBACK'));

            case 42:
              this.logger.error(_context2.t1);

            case 43:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this, [[2, 38], [8, 21, 25, 33], [26,, 28, 32]]);
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