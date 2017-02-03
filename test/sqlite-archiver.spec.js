import fs from 'fs';
import assert from 'power-assert';
import sqlite3 from 'sqlite3';
import Platform from '../src/platform';
import Review from '../src/review';
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
      {platform: Platform.APPSTORE, tableName: 'appstore'},
      {platform: Platform.GOOGLEPLAY, tableName: 'googleplay'}
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
        now.setDate(now.getDate() - 2); // 2日前のレビューはメール通知の対象
        const updated = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
        const title1 = 'title1';
        const title2 = 'title2';
        const content = 'content';
        const rating = 5;
        const version = 1.0;
        const author = 'author';
        const review1 = new Review(id1, updated, title1, content, rating, version, author);
        const review2 = new Review(id2, updated, title2, content, rating, version, author);
        const reviewMap = new Map();
        reviewMap.set(app1, [review1]);
        reviewMap.set(app2, [review2]);
        // Act
        const newReviewMap = await sqliteArchiver.archiveAsync(reviewMap, test.platform);
        
        const reviewList1 = await sqliteArchiver.selectAllReviewAsync(app1, test.tableName);
        const reviewList2 = await sqliteArchiver.selectAllReviewAsync(app2, test.tableName);
        // Assert
        assert(newReviewMap.size === reviewMap.size);
        assert(reviewList1[0].title === title1);
        assert(reviewList2[0].title === title2);

        let wasCalled = false;
        SqliteArchiver.insertReviews = () => { wasCalled = true; };
        const emptyMap = await sqliteArchiver.archiveAsync(reviewMap, test.platform);
        
        assert(wasCalled === false);
        assert(emptyMap.size === 0);
      });
    });
  });
});