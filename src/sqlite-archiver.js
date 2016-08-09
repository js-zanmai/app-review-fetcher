import 'babel-polyfill';// for async/await
import sqlite3 from 'sqlite3';
import Scraper from './scraper';
import util from './utility';
import config from '../config';

const sqlite3Client = sqlite3.verbose();
const dbPath = `${__dirname}/../out/reviews.sqlite`;
const db = new sqlite3Client.Database(dbPath);
const logger = util.getLogger();

function initTableIfNotExists(tableName) {
  db.serialize(() => {
    db.run(
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

function selectIdList(appName, tableName) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all(`SELECT id FROM ${tableName} WHERE app_name = $appName`,
        { $appName: appName },
        (err, res) => {
          if (err) {
            logger.error(err);
            reject(err);
          } else {
            resolve(res);
          }          
        });
    });
  });
}

function insertReviews(reviews, appName, tableName) {
  db.serialize(() => {
    const query = `INSERT INTO ${tableName}(id, app_name, title, content, rating, date, version) VALUES(?, ?, ?, ?, ?, ?, ?)`;
    const stmt = db.prepare(query);
    
    for (const review of reviews) {
      stmt.run(review.id, appName, review.title, review.content, parseInt(review.rating, 10), review.date, review.version);
    }

    stmt.finalize();
  }); 
}

async function archiveAsync(appInfoList, asyncFunc, tableName) {
  try {
    initTableIfNotExists(tableName);

    for (const appInfo of appInfoList) {
      const reviews = await asyncFunc(appInfo.id);
      const savedReviews = await selectIdList(appInfo.name, tableName);

      const reviewIdList = savedReviews.map((review) => {
        return review.id;
      });

      const newReviews = reviews.filter((review) => {
        return !reviewIdList.includes(review.id);
      });
 
      if (newReviews.length > 0) {
        insertReviews(newReviews, appInfo.name, tableName);
        logger.info(`Inserted ${newReviews.length} number of reviews. [Table Name] ${tableName} [App name] ${appInfo.name}`);
      } else {
        logger.info(`Review is nothing. [Table Name] ${tableName} [App name] ${appInfo.name}`);
      }
    }
  } catch (error) {
    logger.error(error);
  }
}

async function main() {
  const scraper = new Scraper();
  await Promise.all([
    archiveAsync(config.appStore, scraper.fetchReviewFromAppStore, 'appstore'),
    archiveAsync(config.googlePlay, scraper.fetchReviewFromGooglePlay, 'googleplay')
  ]);
}

main();

