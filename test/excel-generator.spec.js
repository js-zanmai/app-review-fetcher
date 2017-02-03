import fs from 'fs';
import Platform from '../src/platform';
import Review from '../src/review';
import ExcelGenerator from '../src/excel-generator';
import DummyLogger from './dummy-logger';

describe('ExcelGenerator', () => {
  describe('#generate()', () => {

    const tests = [
      {platform: Platform.APPSTORE, fileName: 'AppStoreReviews.xlsx'},
      {platform: Platform.GOOGLEPLAY, fileName: 'GooglePlayReviews.xlsx'}
    ];

    tests.forEach((test) => {
      it(`should generated ${test.fileName}`, () => {
        const expectedFilePath = `${__dirname}/${test.fileName}`;
        try {
          // Arrange
          const id = 'id';
          const updated = '2016/01/01';
          const title = 'title';
          const content = 'content';
          const rating = 5;
          const version = 1.0;
          const author = 'author';
          const review = new Review(id, updated, title, content, rating, version, author);
          const reviewMap = new Map();
          reviewMap.set('hoge', [review]);
          reviewMap.set('moge', [review]);
          const excelGenerator = new ExcelGenerator(new DummyLogger());
          // Act
          excelGenerator.generate(reviewMap, test.platform, __dirname);
          // Assert
          fs.accessSync(expectedFilePath);
        } finally {
          fs.unlinkSync(expectedFilePath);
        }
      });
    });
  });
});