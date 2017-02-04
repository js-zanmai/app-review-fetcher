'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GooglePlayScraper = exports.AppStoreScraper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // for async/await


require('babel-polyfill');

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _cheerioHttpcli = require('cheerio-httpcli');

var _cheerioHttpcli2 = _interopRequireDefault(_cheerioHttpcli);

var _utility = require('./utility');

var _utility2 = _interopRequireDefault(_utility);

var _review = require('./review');

var _review2 = _interopRequireDefault(_review);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scraper = function () {
  function Scraper(logger) {
    _classCallCheck(this, Scraper);

    this.logger = logger;
  }

  _createClass(Scraper, [{
    key: 'fetchAsync',
    value: function fetchAsync(id) {
      return regeneratorRuntime.async(function fetchAsync$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              throw new TypeError('Do not call abstract method, Can not fetch id = ' + id + '.');

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);

  return Scraper;
}();

var AppStoreScraper = function (_Scraper) {
  _inherits(AppStoreScraper, _Scraper);

  function AppStoreScraper(logger) {
    _classCallCheck(this, AppStoreScraper);

    return _possibleConstructorReturn(this, (AppStoreScraper.__proto__ || Object.getPrototypeOf(AppStoreScraper)).call(this, logger));
  }

  _createClass(AppStoreScraper, [{
    key: 'fetchAsync',
    value: function fetchAsync(id) {
      var _this2 = this;

      return regeneratorRuntime.async(function fetchAsync$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              this.logger.info('Start fetching from AppStore. [id] = ' + id);

              return _context2.abrupt('return', new Promise(function (resolve, reject) {
                var RSS = 'https://itunes.apple.com/jp/rss/customerreviews/id=' + id + '/xml';
                var reviews = [];
                var done = false;

                var fetchRecursive = function fetchRecursive(url) {
                  return _cheerioHttpcli2.default.fetch(url).then(function (result) {
                    var $ = result.$;
                    var firstPage = $('link[rel=first]').attr('href');
                    var nextPage = $('link[rel=next]').attr('href');
                    var lastPage = $('link[rel=last]').attr('href');

                    $('feed > entry').each(function (i, element) {
                      // 最初のentryタグは関係ないのでスキップする。
                      if (i === 0) {
                        return;
                      }

                      if (!_ramda2.default.contains(id, _ramda2.default.map(function (x) {
                        return x.id;
                      }, reviews))) {
                        reviews.push(_this2.parse($(element)));
                      }
                    });

                    if (done || !nextPage || firstPage === lastPage) {
                      return reviews;
                    }

                    // 次のページが最終ページであればフラグを立てておき、クロールを止めるようにする。
                    done = nextPage === lastPage;
                    // linkタグをクロールすることで過去のレビューを再帰的に取得する。
                    return fetchRecursive(nextPage);
                  }).catch(function (err) {
                    _this2.logger.error(err);
                    reject(err);
                  });
                };

                fetchRecursive(RSS).then(function (result) {
                  _this2.logger.info('End fetching from AppStore. [id] = ' + id);
                  resolve(result);
                });
              }));

            case 2:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'parse',
    value: function parse($entry) {
      var id = $entry.find('id').text();
      var date = $entry.find('updated').text().replace(/(.*?)-(.*?)-(.*?)T(.*?)-.*/, '$1/$2/$3 $4');
      var title = $entry.find('title').text();
      var content = $entry.find('content[type=text]').text();
      var rating = $entry.find('im\\:rating').text(); // :はエスケープしないとエラーになるので注意。
      var version = $entry.find('im\\:version').text();
      var author = $entry.find('author > name').text();
      return new _review2.default(id, date, title, content, rating, version, author);
    }
  }]);

  return AppStoreScraper;
}(Scraper);

var GooglePlayScraper = function (_Scraper2) {
  _inherits(GooglePlayScraper, _Scraper2);

  function GooglePlayScraper(logger) {
    _classCallCheck(this, GooglePlayScraper);

    return _possibleConstructorReturn(this, (GooglePlayScraper.__proto__ || Object.getPrototypeOf(GooglePlayScraper)).call(this, logger));
  }

  _createClass(GooglePlayScraper, [{
    key: 'fetchAsync',
    value: function fetchAsync(id) {
      var allReviews, maxCountPerPage, page, tmpReviews;
      return regeneratorRuntime.async(function fetchAsync$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              this.logger.info('Start fetching from GooglePlay. [id] = ' + id);
              allReviews = [];
              maxCountPerPage = 40; // 1リクエストあたり最大40件取得できる。

              page = 0;

            case 4:
              if (!true) {
                _context3.next = 17;
                break;
              }

              _context3.t0 = Array;
              _context3.next = 8;
              return regeneratorRuntime.awrap(this.fetchBodyAsync(id, page));

            case 8:
              _context3.t1 = _context3.sent;
              tmpReviews = _context3.t0.from.call(_context3.t0, _context3.t1);

              tmpReviews.forEach(function (x) {
                return allReviews.push(x);
              });
              page++;

              if (!(tmpReviews.length < maxCountPerPage)) {
                _context3.next = 15;
                break;
              }

              this.logger.info('End fetching from GooglePlay. [id] = ' + id + ', [page] = ' + page);
              return _context3.abrupt('break', 17);

            case 15:
              _context3.next = 4;
              break;

            case 17:
              return _context3.abrupt('return', allReviews);

            case 18:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'fetchBodyAsync',
    value: function fetchBodyAsync(id, page) {
      var params, responseBody, content, targetHtml;
      return regeneratorRuntime.async(function fetchBodyAsync$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              params = {
                method: 'POST',
                uri: 'https://play.google.com/store/getreviews',
                form: {
                  pageNum: page,
                  id: id,
                  reviewSortOrder: 0,
                  hl: 'jp',
                  reviewType: 0,
                  xhr: 1
                },
                json: true
              };
              _context4.next = 3;
              return regeneratorRuntime.awrap(this.doRequestAsync(params));

            case 3:
              responseBody = _context4.sent;
              content = JSON.parse(responseBody.slice(6));
              targetHtml = content[0][2];
              return _context4.abrupt('return', this.parse(_cheerio2.default.load(targetHtml)));

            case 7:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'doRequestAsync',
    value: function doRequestAsync(params) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        (0, _request2.default)(params, function (error, response, body) {
          if (error) {
            _this4.logger.error(error);
            reject(error);
          } else {
            resolve(body);
          }
        });
      });
    }
  }, {
    key: 'parse',
    value: function parse($) {
      var reviews = [];
      $('div.review-link').remove();
      $('.single-review').each(function (i, element) {
        var reviewInfo = $(element).find('.review-info');
        var id = $(element).find('.review-header').attr('data-reviewid');
        var tmpDate = $(reviewInfo).find('.review-date').text().match(/(.*)年(.*)月(.*)日/);
        var updated = tmpDate[1] + '/' + _utility2.default.zeroPadding(tmpDate[2]) + '/' + _utility2.default.zeroPadding(tmpDate[3]);
        var rating = $(reviewInfo).find('.review-info-star-rating .tiny-star').attr('aria-label').match(/5つ星のうち(.*)つ星で評価しました/)[1];
        var reviewBody = $(element).find('.review-body.with-review-wrapper');
        var title = $(reviewBody).find('.review-title').text();
        var content = $(reviewBody).text().replace(title, '').trim();
        var author = $(reviewInfo).find('.author-name').text().trim();
        reviews.push(new _review2.default(id, updated, title, content, rating, '-', author));
      });

      return reviews;
    }
  }]);

  return GooglePlayScraper;
}(Scraper);

exports.AppStoreScraper = AppStoreScraper;
exports.GooglePlayScraper = GooglePlayScraper;