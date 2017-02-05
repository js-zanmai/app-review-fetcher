import 'babel-polyfill';// for async/await
import yaml from 'js-yaml';
import fs from 'fs';
import util from './utility';
import { AppStoreScraper, GooglePlayScraper } from './scraper';
import ExcelGenerator from './excel-generator';
import SqliteArchiver from './sqlite-archiver';
import MailNotifier from './mail-notifier';
import SlackNotifier from './slack-notifier';

const logger = util.getLogger();
const config = yaml.safeLoad(fs.readFileSync(`${__dirname}/../config.yml`, 'utf8'));

const Platform = {
  IOS: Symbol(),
  ANDROID: Symbol()
};

class AppKind {
  constructor(service, platform) {
    this.service = service;
    this.platform = platform;
  }
}

async function fetchAsyncBody(appSettings, scraper) {
  const reviewMap = new Map();
  for (const appSetting of appSettings) {
    const reviews = await scraper.fetchAsync(appSetting.id);
    logger.info(`${reviews.length} reviews fetched. [App name] ${appSetting.name}`);
    reviewMap.set(appSetting.name, reviews);
    await util.sleep();
  }
  return reviewMap;
}

async function fetchAsync(platform) {
  switch(platform) {
  case Platform.IOS:
    return await fetchAsyncBody(config.appStore, new AppStoreScraper(logger));
  case Platform.ANDROID:
    return await fetchAsyncBody(config.googlePlay, new GooglePlayScraper(logger));
  default:
    throw new Error('invalid platform!!');
  }
}

function map2Excel(reviewMap, fileNameWithoutExtension) {
  const excel = new ExcelGenerator(logger);
  excel.generate(reviewMap, config.excel.outDir, fileNameWithoutExtension);
}

async function map2SqliteAsync(reviewMap, tableName) {
  const sqlite = new SqliteArchiver(config.sqlite.dbPath, logger);
  try {
    return await sqlite.archiveAsync(reviewMap, tableName);
  } finally {
    sqlite.close();
  }
}

async function map2MailAsync(reviewMap, mailSubject) {
  const mail = new MailNotifier(logger);
  await mail.notifyAsync(reviewMap, mailSubject, config.mail);
}

function map2Slack(reviewMap, platform) {
  const slack = new SlackNotifier(logger);
  slack.notify(reviewMap, platform, config.slack);
}

function getKind(platform) {
  switch(platform) {
  case Platform.IOS:
    return new AppKind('AppStore', 'iOS');
  case Platform.ANDROID:
    return new AppKind('GooglePlay', 'Android');
  default:
    throw new Error('invalid platform!!');
  }
}

async function runAsync(platform) {
  try {
    const reviewMap = await fetchAsync(platform);
    const kind = getKind(platform);
    map2Excel(reviewMap, kind.service + 'Reviews');
    const newReviewMap = await map2SqliteAsync(reviewMap, kind.service.toLowerCase());
    await map2MailAsync(newReviewMap, kind.service);
    map2Slack(newReviewMap, kind.platform);
  } catch (err) {
    logger.error(err);
  }
}

async function main() {
  await runAsync(Platform.IOS);
  await runAsync(Platform.ANDROID);
}

main();