import Excel from 'exceljs';
import path from 'path';

export default class ExcelGenerator {

  constructor(logger) {
    this.logger = logger;
  }

  formatHeaderRow(row) {
    row.eachCell((cell) => {
      cell.font = {
        name: 'HG丸ｺﾞｼｯｸM-PRO',
        size: 10,
        italic: true
      };

      cell.border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'double'},
        right: {style: 'thin'}
      };
      
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      }; 
    });
  }

  formatContentRow(row) {
    row.eachCell((cell, cellNumber) => {
      const fontStyle = {
        name: 'メイリオ',
        size: 10
      };

      if (cellNumber === 4) {
        fontStyle.color = { argb: 'FFFFFFFF' };
      }

      cell.font = fontStyle;

      cell.border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
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
      
      const fillStyle = {
        type: 'pattern',
        pattern: 'solid'
      };

      if (cellNumber === 4 ) {
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

  formatWorksheet(worksheet) {
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 75;
    worksheet.getColumn(4).width = 7;
    worksheet.getColumn(6).width = 18;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1 /* Header row */) {
        this.formatHeaderRow(row);
      } else {
        this.formatContentRow(row);
      }
    });
  }

  addWorksheet(workbook, reviewMap) {
    reviewMap.forEach((reviews, name) => {
      const worksheet = workbook.addWorksheet(name);
      worksheet.addRow(['date', 'title', 'content', 'star', 'version', 'author']);

      reviews.forEach((review) => {
        worksheet.addRow([review.date, review.title, review.content, parseInt(review.rating, 10), review.version, review.author]);
      });
      this.formatWorksheet(worksheet);
    });
  }

  saveFile(workbook, absPath) {
    workbook.xlsx.writeFile(absPath)
    .then(() => {
      this.logger.info(`Finished generate ${absPath}`);
    })
    .catch( (error) => {
      this.logger.error(error);
    });
  }

  generate(reviewMap, outDir, fileNameWithoutExtension) {
    try {
      this.logger.info(`Start generate ${fileNameWithoutExtension}`);
      const workbook = new Excel.Workbook();
      const now = new Date();
      workbook.created = now;
      workbook.modified = now;
      this.addWorksheet(workbook, reviewMap);
      const absPath = path.join(outDir, `${fileNameWithoutExtension}.xlsx`);
      this.saveFile(workbook, absPath);
    } catch (error) {
      this.logger.error(error);
    }
  }
}

