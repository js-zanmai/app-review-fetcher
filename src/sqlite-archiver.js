import 'babel-polyfill';// for async/await
import sqlite3 from 'sqlite3';
import R from 'ramda';

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

  // 稀に古いレビューが返ってくることがあったため、DBに存在していない、かつ、直近３日以内のレビューを新着レビューと判定する。
  extractRecentReviews(reviews) {
    const now = new Date();
    const threeDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
    return reviews.filter((review) => {
      const date = new Date(review.date);
      return date.getTime() >= threeDaysAgo.getTime();
    });
  }

  async searchNewReviewsAsync(reviews, appName, tableName) {
    const savedReviews = await this.selectAllReviewAsync(appName, tableName);
    const isSameReview = (saved, review) => (review.date === saved.date) && (review.title === saved.title) && (review.author === saved.author);
    const curriedIsSameReview = R.curry(isSameReview);
    const isNewReview = x => !R.any(curriedIsSameReview(x))(savedReviews);
    return R.filter(isNewReview, reviews);
  }

  async archiveAsync(reviewMap, tableName) {
    await this.db.run('BEGIN');
    try {
      this.initTableIfNotExists(tableName);
      const newReviewMap = new Map();
      for (const [appName, reviews] of reviewMap.entries()) {
        const newReviews = await this.searchNewReviewsAsync(reviews, appName, tableName);
        
        if (R.isEmpty(newReviews)) {
          this.logger.info(`New review is nothing. [Table Name] ${tableName} [App name] ${appName}`);
        } else {
          this.insertReviews(newReviews, appName, tableName);
          const recentReviews = this.extractRecentReviews(newReviews);
          if (!R.isEmpty(recentReviews)) {
            newReviewMap.set(appName, recentReviews);
          }
          this.logger.info(`Inserted ${newReviews.length} number of reviews. [Table Name] ${tableName} [App name] ${appName}`);
        }
      }
      await this.db.run('COMMIT');
      return newReviewMap;
    } catch (err) {
      await this.db.run('ROLLBACK');
      this.logger.error(err);
    }
  }

  close() {
    this.db.close();
  }

}