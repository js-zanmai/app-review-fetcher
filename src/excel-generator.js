import 'babel-polyfill';// for async/await
import Scraper from './scraper';
import config from '../config';
import officegen from 'officegen';
import fs from 'fs';

async function createExcelReportAsync(appInfoList, asyncFunc, fileNameWithoutExtension) {
  try {
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
    out.on('error', (error) => {
      console.log(error);
    });
    xlsx.generate(out);
  } catch (error) {
    console.log('Error:', error);
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