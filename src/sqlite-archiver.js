import 'babel-polyfill';// for async/await
import sqlite3 from 'sqlite3';
import R from 'ramda';
import PlatformType from './platform';


export default class SqliteArchiver {

  constructor(dbPath, logger) {
    const sqlite3Client = sqlite3.verbose();
    this.db = new sqlite3Client.Database(dbPath);
    this.logger = logger;
  }

  initTableIfNotExists(tableName) {
    this.db.serialize(() => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS ${tableName}(` +
        'app_name TEXT, ' +
        'title TEXT, ' +
        'content TEXT, ' +
        'author TEXT, ' +
        'rating INTEGER, ' +
        'date TEXT, ' +
        'version TEXT)'
      );
    });
  }

  selectAllReviewAsync(appName, tableName) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.all(`SELECT * FROM ${tableName} WHERE app_name = $appName`,
          { $appName: appName },
          (err, res) => {
            if (err) {
              this.logger.error(err);
              reject(err);
            } else {
              resolve(res);
            }          
          });
      });
    });
  }

  insertReviews(reviews, appName, tableName) {
    this.db.serialize(() => {
      const query = `INSERT INTO ${tableName}(app_name, title, content, author, rating, date, version) VALUES(?, ?, ?, ?, ?, ?, ?)`;
      const stmt = this.db.prepare(query);
      reviews.forEach(x => stmt.run(appName, x.title, x.content, x.author, parseInt(x.rating, 10), x.date, x.version));
      stmt.finalize();
    }); 
  }

  async archiveAsync(appReviewInfoList, platformType) {
    await this.db.run('BEGIN');
    try {
      const tableName = platformType === PlatformType.APPSTORE ? 'appstore' : 'googleplay'; 
      this.initTableIfNotExists(tableName);
      
      for (const appReviewInfo of appReviewInfoList) {
        const savedReviews = await this.selectAllReviewAsync(appReviewInfo.name, tableName);
        const isSameReview = (saved, review) => (review.date === saved.date) && (review.title === saved.title) && (review.author === saved.author);
        const curriedIsSameReview = R.curry(isSameReview);
        const isNewReview = x => R.all(curriedIsSameReview(x))(savedReviews);
        const newReviews = R.filter(isNewReview, appReviewInfo.reviews);

        if (R.isEmpty(newReviews)) {
          this.logger.info(`New review is nothing. [Table Name] ${tableName} [App name] ${appReviewInfo.name}`);
        } else {
          this.insertReviews(newReviews, appReviewInfo.name, tableName);
          this.logger.info(`Inserted ${newReviews.length} number of reviews. [Table Name] ${tableName} [App name] ${appReviewInfo.name}`);
        }
      }
      await this.db.run('COMMIT');
    } catch (error) {
      await this.db.run('ROLLBACK');
      this.logger.error(error);
    }
  
  }

  close() {
    this.db.close();
  }

}