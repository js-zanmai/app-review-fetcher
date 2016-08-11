import 'babel-polyfill';// for async/await
import AppReviewInfo from './app-review-info';
import config from '../config';
import util from './utility';
import PlatformType from './platform';
import Scraper from './scraper';
import { generateExcelReport } from './excel-generator';
import { archiveAsync } from './sqlite-archiver';
import { notifyAsync } from './mail-notifier';


async function scrapeAppReviewInfoListBody(appSettings, asyncFunc) {
  const appReviewInfoList = [];

  for (const appSetting of appSettings) {
    const reviews = await asyncFunc(appSetting.id);
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
      generateExcelReport(appReviewInfoList, platformType);
    }

    if (config.service.sqlite) {
      await archiveAsync(appReviewInfoList, platformType);
    }

    if (config.service.mail) {
      await notifyAsync(appReviewInfoList, platformType);
    }

  } catch (error) {
    util.getLogger().error(error);
  }
}

async function main() {
  await Promise.all([
    executeAsync(PlatformType.APPSTORE),
    executeAsync(PlatformType.GOOGLEPLAY)
  ]);
}

main();