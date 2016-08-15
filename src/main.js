import 'babel-polyfill';// for async/await
import AppReviewInfo from './app-review-info';
import config from '../config';
import util from './utility';
import PlatformType from './platform';
import Scraper from './scraper';
import ExcelGenerator from './excel-generator';
import SqliteArchiver from './sqlite-archiver';
import MailNotifier from './mail-notifier';

const logger = util.getLogger();

async function scrapeAppReviewInfoListBody(appSettings, asyncFunc) {
  const appReviewInfoList = [];

  for (const appSetting of appSettings) {
    const reviews = await asyncFunc(appSetting.id);
    logger.info(`${reviews.length} reviews fetched. [App name] ${appSetting.name}`);
    appReviewInfoList.push(new AppReviewInfo(appSetting.name, reviews));
  }

  return appReviewInfoList;
}

async function scrapeAppReviewInfoList(platform) {
  const scraper = new Scraper();

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