import 'babel-polyfill';// for async/await
import R from 'ramda';
import config from '../config';
import util from './utility';
import PlatformType from './platform';
import Scraper from './scraper';
import ExcelGenerator from './excel-generator';
import SqliteArchiver from './sqlite-archiver';
import MailNotifier from './mail-notifier';

const logger = util.getLogger();

async function fetchReviewMapBody(appSettings, asyncFunc) {
  const map = new Map();
  for (const appSetting of appSettings) {
    const reviews = await asyncFunc(appSetting.id);
    logger.info(`${reviews.length} reviews fetched. [App name] ${appSetting.name}`);
    map.set(appSetting.name, reviews);
    await util.sleep();
  }

  return map;
}

async function fetchReviewMap(platform) {
  const scraper = new Scraper();

  if (platform === PlatformType.APPSTORE) {
    return await fetchReviewMapBody(config.appStore, scraper.fetchReviewFromAppStore);
  } else {
    return await fetchReviewMapBody(config.googlePlay, scraper.fetchReviewFromGooglePlay);
  }
}

async function runAsync(platformType) {
  try {
    const reviewMap = await fetchReviewMap(platformType);

    const excelGenerator = new ExcelGenerator(logger);
    excelGenerator.generate(reviewMap, platformType, `${__dirname}/../out`);
    
    const sqliteArchiver = new SqliteArchiver(`${__dirname}/../out/reviews.sqlite`, logger);
    
    try {
      const newReviewMap = await sqliteArchiver.archiveAsync(reviewMap, platformType);
      if (config.mail.IsEnabled && !R.isEmpty(newReviewMap)) {
        const mailNotifier = new MailNotifier(logger);
        await mailNotifier.notifyAsync(newReviewMap, platformType);
      }
    } finally {
      sqliteArchiver.close();
    }
  } catch (error) {
    logger.error(error);
  }
}

async function main() {
  await runAsync(PlatformType.APPSTORE);
  await runAsync(PlatformType.GOOGLEPLAY);
}

main();