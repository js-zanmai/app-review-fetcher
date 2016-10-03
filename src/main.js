import 'babel-polyfill';// for async/await
import R from 'ramda';
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

    const excelGenerator = new ExcelGenerator(logger);
    excelGenerator.generate(appReviewInfoList, platformType, `${__dirname}/../out`);
    
    const sqliteArchiver = new SqliteArchiver(`${__dirname}/../out/reviews.sqlite`, logger);
    
    try {
      const newAppReviewInfoList = await sqliteArchiver.archiveAsync(appReviewInfoList, platformType);
      const now = new Date();
      const threeDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
      // 稀に古いレビューが返ってくることがあったため、DBに存在していない、かつ、直近３日以内のレビューを新着とする。
      const targetReviewInfoList = newAppReviewInfoList.filter((review) => new Date(review.date) >= threeDaysAgo);
      if (config.mail.IsEnabled && !R.isEmpty(targetReviewInfoList)) {
        const mailNotifier = new MailNotifier(logger);
        await mailNotifier.notifyAsync(targetReviewInfoList, platformType);
      }
    } finally {
      sqliteArchiver.close();
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