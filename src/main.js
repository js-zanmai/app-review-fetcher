import 'babel-polyfill';// for async/await
import log4js from 'log4js'; 
import AppReviewInfo from './app-review-info';
import config from '../config';
import PlatformType from './platform';
import Scraper from './scraper';
import ExcelGenerator from './excel-generator';
import SqliteArchiver from './sqlite-archiver';
import MailNotifier from './mail-notifier';

log4js.configure(`${__dirname}/../log4js.json`); 
const logger = log4js.getLogger('fileAppender');

async function scrapeAppReviewInfoListBody(appSettings, asyncFunc) {
  const appReviewInfoList = [];

  for (const appSetting of appSettings) {
    const reviews = await asyncFunc(appSetting.id);
    appReviewInfoList.push(new AppReviewInfo(appSetting.name, reviews));
  }

  return appReviewInfoList;
}

async function scrapeAppReviewInfoList(platform) {
  const scraper = new Scraper(logger);

  if (platform === PlatformType.APPSTORE) {
    return await scrapeAppReviewInfoListBody(config.appStore, scraper.fetchReviewFromAppStore);
  } else {
    return await scrapeAppReviewInfoListBody(config.googlePlay, scraper.fetchReviewFromGooglePlay);
  }
}

async function executeAsync(platformType) {
  try {
    const appReviewInfoList = await scrapeAppReviewInfoList(platformType);

    if (config.service.excel) {
      const excelGenerator = new ExcelGenerator(logger);
      excelGenerator.generate(appReviewInfoList, platformType, `${__dirname}/../out`);
    }

    if (config.service.sqlite) {
      const sqliteArchiver = new SqliteArchiver(`${__dirname}/../out/reviews.sqlite`, logger);
      try {
        await sqliteArchiver.archiveAsync(appReviewInfoList, platformType);
      } finally {
        sqliteArchiver.close();
      }
    }

    if (config.service.mail) {
      const mailNotifier = new MailNotifier(logger);
      await mailNotifier.notifyAsync(appReviewInfoList, platformType);
    }

  } catch (error) {
    logger.error(error);
  }
}

async function main() {
  await executeAsync(PlatformType.APPSTORE);
  await executeAsync(PlatformType.GOOGLEPLAY);
}

main();