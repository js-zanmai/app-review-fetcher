'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
    key: 'addWorksheet',
    value: function addWorksheet(workbook, reviewMap) {
      var _this2 = this;

      reviewMap.forEach(function (reviews, name) {
        var worksheet = workbook.addWorksheet(name);
        worksheet.addRow(['date', 'title', 'content', 'star', 'version', 'author']);

        reviews.forEach(function (review) {
          worksheet.addRow([review.date, review.title, review.content, parseInt(review.rating, 10), review.version, review.author]);
        });
        _this2.formatWorksheet(worksheet);
      });
    }
  }, {
    key: 'saveFile',
    value: function saveFile(workbook, absPath) {
      var _this3 = this;

      workbook.xlsx.writeFile(absPath).then(function () {
        _this3.logger.info('Finished generate ' + absPath);
      }).catch(function (error) {
        _this3.logger.error(error);
      });
    }
  }, {
    key: 'generate',
    value: function generate(reviewMap, outDir, fileNameWithoutExtension) {
      try {
        this.logger.info('Start generate ' + fileNameWithoutExtension);
        var workbook = new _exceljs2.default.Workbook();
        var now = new Date();
        workbook.created = now;
        workbook.modified = now;
        this.addWorksheet(workbook, reviewMap);
        var absPath = _path2.default.join(outDir, fileNameWithoutExtension + '.xlsx');
        this.saveFile(workbook, absPath);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }]);

  return ExcelGenerator;
}();

exports.default = ExcelGenerator;