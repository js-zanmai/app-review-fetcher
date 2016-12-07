'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _platform = require('./platform');

var _platform2 = _interopRequireDefault(_platform);

var _exceljs = require('exceljs');

var _exceljs2 = _interopRequireDefault(_exceljs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ExcelGenerator = function () {
  function ExcelGenerator(logger) {
    _classCallCheck(this, ExcelGenerator);

    this.logger = logger;
  }

  _createClass(ExcelGenerator, [{
    key: 'formatHeaderRow',
    value: function formatHeaderRow(row) {
      row.eachCell(function (cell) {
        cell.font = {
          name: 'HG丸ｺﾞｼｯｸM-PRO',
          size: 10,
          italic: true
        };

        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'double' },
          right: { style: 'thin' }
        };

        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center'
        };
      });
    }
  }, {
    key: 'formatContentRow',
    value: function formatContentRow(row) {
      row.eachCell(function (cell, cellNumber) {
        var fontStyle = {
          name: 'メイリオ',
          size: 10
        };

        if (cellNumber === 4) {
          fontStyle.color = { argb: 'FFFFFFFF' };
        }

        cell.font = fontStyle;

        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        if (cellNumber === 4 || cellNumber === 5) {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        } else {
          cell.alignment = {
            vertical: 'top',
            horizontal: 'left',
            wrapText: true
          };
        }

        var fillStyle = {
          type: 'pattern',
          pattern: 'solid'
        };

        if (cellNumber === 4) {
          switch (cell.value) {
            case 1:
              fillStyle.fgColor = { argb: '64ff0000' };
              break;
            case 2:
              fillStyle.fgColor = { argb: '64ffc000' };
              break;
            case 3:
              fillStyle.fgColor = { argb: '6492d050' };
              break;
            case 4:
              fillStyle.fgColor = { argb: '6400b050' };
              break;
            case 5:
              fillStyle.fgColor = { argb: '640070c0' };
              break;
          }
          cell.fill = fillStyle;
        }
      });
    }
  }, {
    key: 'formatWorksheet',
    value: function formatWorksheet(worksheet) {
      var _this = this;

      worksheet.getColumn(1).width = 20;
      worksheet.getColumn(2).width = 20;
      worksheet.getColumn(3).width = 75;
      worksheet.getColumn(4).width = 7;
      worksheet.getColumn(6).width = 18;

      worksheet.eachRow(function (row, rowNumber) {
        if (rowNumber === 1 /* Header row */) {
            _this.formatHeaderRow(row);
          } else {
          _this.formatContentRow(row);
        }
      });
    }
  }, {
    key: 'generate',
    value: function generate(appReviewInfoList, platformType, outputFolder) {
      var _this2 = this;

      try {
        (function () {
          var fileNameWithoutExtension = platformType === _platform2.default.APPSTORE ? 'AppStoreReviews' : 'GooglePlayReviews';
          _this2.logger.info('Start generate ' + fileNameWithoutExtension);
          var workbook = new _exceljs2.default.Workbook();
          var now = new Date();
          workbook.created = now;
          workbook.modified = now;

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            var _loop = function _loop() {
              var appReviewInfo = _step.value;

              var worksheet = workbook.addWorksheet(appReviewInfo.name);
              worksheet.addRow(['date', 'title', 'content', 'star', 'version', 'author']);

              appReviewInfo.reviews.forEach(function (review) {
                worksheet.addRow([review.date, review.title, review.content, parseInt(review.rating, 10), review.version, review.author]);
              });
              _this2.formatWorksheet(worksheet);
            };

            for (var _iterator = appReviewInfoList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              _loop();
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          var absPath = _path2.default.join(outputFolder, fileNameWithoutExtension + '.xlsx');
          workbook.xlsx.writeFile(absPath).then(function () {
            _this2.logger.info('Finished generate ' + fileNameWithoutExtension);
          }).catch(function (error) {
            _this2.logger.error(error);
          });
        })();
      } catch (error) {
        this.logger.error(error);
      }
    }
  }]);

  return ExcelGenerator;
}();

exports.default = ExcelGenerator;