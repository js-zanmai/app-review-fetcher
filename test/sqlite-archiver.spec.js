import fs from 'fs';
import { expect } from 'chai';
import sqlite3 from 'sqlite3';
import PlatformType from '../src/platform';
import Review from '../src/review';
import AppReviewInfo from '../src/app-review-info';
import SqliteArchiver from '../src/sqlite-archiver';
import DummyLogger from './dummy-logger';

describe('SqliteArchiver', () => {

  const testDbPath = `${__dirname}/test.sqlite`;
  let sqliteArchiver;
  const db = new sqlite3.Database(testDbPath);

  before(() => {
    sqliteArchiver = new SqliteArchiver(testDbPath, new DummyLogger);
  });

  after(() => {
    sqliteArchiver.close();
    db.close();
    fs.unlinkSync(testDbPath);
  });

  describe('#initTableIfNotExists()', () => {
    it('should create the table', () => {
      sqliteArchiver.initTableIfNotExists('test');
    });
  });

  describe('#archiveAsync()', () => {

    const tests = [
      {platformType: PlatformType.APPSTORE, tableName: 'appstore'},
      {platformType: PlatformType.GOOGLEPLAY, tableName: 'googleplay'}
    ];

    tests.forEach((test) => {
      it(`should inserted the review ${test.tableName}`, async function() {
        this.timeout(5000);
        // Arrange
        const app1 = 'hoge';
        const app2 = 'moge';
        const id1 = test.tableName + 'id1';
        const id2 = test.tableName + 'id2';
        const now = new Date();
        const updated = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate() - 2}`; // 2日前のレビューはメール通知の対象
        const title1 = 'title1';
        const title2 = 'title2';
        const content = 'content';
        const rating = 5;
        const version = 1.0;
        const author = 'author';
        const review1 = new Review(id1, updated, title1, content, rating, version, author);
        const review2 = new Review(id2, updated, title2, content, rating, version, author);
        const appReviewInfoList = [new AppReviewInfo(app1, [review1]), new AppReviewInfo(app2, [review2])];
        // Act
        const newAppReviewInfoList = await sqliteArchiver.archiveAsync(appReviewInfoList, test.platformType);
        
        const reviewList1 = await sqliteArchiver.selectAllReviewAsync(app1, test.tableName);
        const reviewList2 = await sqliteArchiver.selectAllReviewAsync(app2, test.tableName);
        // Assert
        expect(newAppReviewInfoList.length).to.equal(appReviewInfoList.length);
        expect(reviewList1[0].title).to.equal(title1);
        expect(reviewList2[0].title).to.equal(title2);
        
        let wasCalled = false;
        SqliteArchiver.insertReviews = (reviews, appName, tableName) => { wasCalled = true; };
        const emptyArray = await sqliteArchiver.archiveAsync(appReviewInfoList, test.platformType);
        
        expect(wasCalled).to.be.false;
        expect(emptyArray.length).to.equal(0);
      });
    });
  });
});