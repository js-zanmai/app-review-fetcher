import 'babel-polyfill';// for async/await
import config from '../config';
import util from './utility';
import Scraper from './scraper';
import ExcelGenerator from './excel-generator';
import SqliteArchiver from './sqlite-archiver';
import MailNotifier from './mail-notifier';

const logger = util.getLogger();
const outDir = `${__dirname}/../out`;
const dbFile = `${outDir}/reviews.sqlite`;

const Platform = {
  APPSTORE: Symbol(),
  GOOGLEPLAY: Symbol()
};

class Param {
  constructor(mailSubject, tableName, fileNameWithoutExtension) {
    this.mailSubject = mailSubject;
    this.tableName = tableName;
    this.fileNameWithoutExtension = fileNameWithoutExtension;
  }
}

async function fetchAsyncBody(appSettings, asyncFunc) {
  const reviewMap = new Map();
  for (const appSetting of appSettings) {
    const reviews = await asyncFunc(appSetting.id);
    logger.info(`${reviews.length} reviews fetched. [App name] ${appSetting.name}`);
    reviewMap.set(appSetting.name, reviews);
    await util.sleep();
  }
  return reviewMap;
}

async function fetchAsync(platform) {
  const scraper = new Scraper();
  switch(platform) {
  case Platform.APPSTORE:
    return await fetchAsyncBody(config.appStore, scraper.fetchReviewFromAppStore);
  case Platform.GOOGLEPLAY:
    return await fetchAsyncBody(config.googlePlay, scraper.fetchReviewFromGooglePlay);
  default:
    throw new Error('invalid platform!!');
  }
}

function map2Excel(reviewMap, fileNameWithoutExtension) {
  const excel = new ExcelGenerator(logger);
  excel.generate(reviewMap, outDir, fileNameWithoutExtension);
}

async function map2SqliteAsync(reviewMap, tableName) {
  const sqlite = new SqliteArchiver(dbFile, logger);
  try {
    return await sqlite.archiveAsync(reviewMap, tableName);
  } finally {
    sqlite.close();
  }
}

async function map2MailAsync(reviewMap, mailSubject) {
  const mailNotifier = new MailNotifier(logger);
  await mailNotifier.notifyAsync(reviewMap, mailSubject);
}

function getParams(platform) {
  switch(platform) {
  case Platform.APPSTORE:
    return new Param(
      '【AppStore新着レビュー】',
      'appstore',
      'AppStoreReviews'
    );
  case Platform.GOOGLEPLAY:
    return new Param(
      '【GooglePlay新着レビュー】',
      'googleplay',
      'GooglePlayReviews'
    );
  default:
    throw new Error('invalid platform!!');
  }
}

async function runAsync(platform) {
  try {
    const reviewMap = await fetchAsync(platform);
    const param = getParams(platform);
    map2Excel(reviewMap, param.fileNameWithoutExtension);
    const newReviewMap = await map2SqliteAsync(reviewMap, param.tableName);
    if (config.mail.IsEnabled) {
      await map2MailAsync(newReviewMap, param.mailSubject);
    }
  } catch (err) {
    logger.error(err);
  }
}

async function main() {
  await runAsync(Platform.APPSTORE);
  await runAsync(Platform.GOOGLEPLAY);
}

main();