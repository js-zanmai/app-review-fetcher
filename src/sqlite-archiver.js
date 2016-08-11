import 'babel-polyfill';// for async/await
import sqlite3 from 'sqlite3';
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
        'id TEXT PRIMARY KEY, ' + 
        'app_name TEXT, ' +
        'title TEXT, ' +
        'content TEXT, ' +
        'rating INTEGER, ' +
        'date TEXT, ' +
        'version TEXT)'
      );
    });
  }

  selectIdListAsync(appName, tableName) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.all(`SELECT id FROM ${tableName} WHERE app_name = $appName`,
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
      const query = `INSERT INTO ${tableName}(id, app_name, title, content, rating, date, version) VALUES(?, ?, ?, ?, ?, ?, ?)`;
      const stmt = this.db.prepare(query);
      
      for (const review of reviews) {
        stmt.run(review.id, appName, review.title, review.content, parseInt(review.rating, 10), review.date, review.version);
      }

      stmt.finalize();
    }); 
  }

  async archiveAsync(appReviewInfoList, platformType) {
    try {
      const tableName = platformType === PlatformType.APPSTORE ? 'appstore' : 'googleplay'; 

      this.initTableIfNotExists(tableName);
      
      for (const appReviewInfo of appReviewInfoList) {
        const savedReviews = await this.selectIdListAsync(appReviewInfo.name, tableName);
        const reviewIdList = savedReviews.map((review) => {
          return review.id;
        });
        
        const newReviews = appReviewInfo.reviews.filter((review) => {
          return !reviewIdList.includes(review.id);
        });
        
        if (newReviews.length > 0) {
          this.insertReviews(newReviews, appReviewInfo.name, tableName);
          this.logger.info(`Inserted ${newReviews.length} number of reviews. [Table Name] ${tableName} [App name] ${appReviewInfo.name}`);
        } else {
          this.logger.info(`Review is nothing. [Table Name] ${tableName} [App name] ${appReviewInfo.name}`);
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  
  }

  close() {
    this.db.close();
  }

}