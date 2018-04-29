import fs from 'fs';
import assert from 'power-assert';
import sqlite3 from 'sqlite3';
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
    it('should be created the table', () => {
      sqliteArchiver.initTableIfNotExists('test');
    });
  });

  describe('#archiveAsync()', () => {
    it('should be inserted the review', async function() {
      this.timeout(5000);
      // Arrange
      const tableName = 'dummyTable';
      const app1 = 'hoge';
      const app2 = 'moge';
      const id1 = tableName + 'id1';
      const id2 = tableName + 'id2';
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
      const newReviewMap = await sqliteArchiver.archiveAsync(reviewMap, tableName);
      const limit = 5;
      const reviewList1 = await sqliteArchiver.selectRecentReviewAsync(app1, tableName, limit);
      const reviewList2 = await sqliteArchiver.selectRecentReviewAsync(app2, tableName, limit);
      // Assert
      assert(newReviewMap.size === reviewMap.size);
      assert(reviewList1[0].title === title1);
      assert(reviewList2[0].title === title2);

      let wasCalled = false;
      SqliteArchiver.insertReviews = () => { wasCalled = true; };
      const emptyMap = await sqliteArchiver.archiveAsync(reviewMap, tableName);
      
      assert(wasCalled === false);
      assert(emptyMap.size === 0);

    });
  });
});