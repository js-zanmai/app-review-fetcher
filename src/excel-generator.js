import 'babel-polyfill';// for async/await
import util from './utility';
import Scraper from './scraper';
import config from '../config';
import officegen from 'officegen';
import fs from 'fs';

const logger = util.getLogger();

async function createExcelReportAsync(appInfoList, asyncFunc, fileNameWithoutExtension) {
  try {
    logger.info(`Start createExcelReportAsync ${fileNameWithoutExtension}`);
    const xlsx = officegen('xlsx');

    for(const appInfo of appInfoList) {
      const reviews = await asyncFunc(appInfo.id);
      const worksheet = xlsx.makeNewSheet();
      worksheet.name = appInfo.name;
      worksheet.data[0] = ['date', 'title', 'content', 'rating', 'version', 'author'];
      reviews.forEach((review, index) => {  
        worksheet.data[index + 1] = [review.date, review.title, review.content, parseInt(review.rating, 10), review.version, review.author];
      });
    }
   
    const out = fs.createWriteStream(`${__dirname}/../out/${fileNameWithoutExtension}.xlsx`);
    logger.info(`Finished createExcelReportAsync ${fileNameWithoutExtension}`);
    out.on('error', (error) => {
      logger.error(error);
    });
    xlsx.generate(out);
  } catch (error) {
    logger.error(error);
  }
}

async function main() {
  const scraper = new Scraper();
  await Promise.all([
    createExcelReportAsync(config.appStore, scraper.fetchReviewFromAppStore, 'AppStoreReviews'),
    createExcelReportAsync(config.googlePlay, scraper.fetchReviewFromGooglePlay, 'GooglePlayReviews')
  ]);
}

main();