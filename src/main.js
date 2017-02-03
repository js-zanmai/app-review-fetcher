import 'babel-polyfill';// for async/await
import config from '../config';
import util from './utility';
import Platform from './platform';
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

  if (platform === Platform.APPSTORE) {
    return await fetchReviewMapBody(config.appStore, scraper.fetchReviewFromAppStore);
  } else {
    return await fetchReviewMapBody(config.googlePlay, scraper.fetchReviewFromGooglePlay);
  }
}

async function runAsync(platform) {
  try {
    const reviewMap = await fetchReviewMap(platform);

    const excelGenerator = new ExcelGenerator(logger);
    excelGenerator.generate(reviewMap, platform, `${__dirname}/../out`);
    
    const sqliteArchiver = new SqliteArchiver(`${__dirname}/../out/reviews.sqlite`, logger);
    
    try {
      const newReviewMap = await sqliteArchiver.archiveAsync(reviewMap, platform);
      if (config.mail.IsEnabled && (newReviewMap.size !== 0)) {
        const mailNotifier = new MailNotifier(logger);
        await mailNotifier.notifyAsync(newReviewMap, platform);
      }
    } finally {
      sqliteArchiver.close();
    }
  } catch (error) {
    logger.error(error);
  }
}

async function main() {
  await runAsync(Platform.APPSTORE);
  await runAsync(Platform.GOOGLEPLAY);
}

main();