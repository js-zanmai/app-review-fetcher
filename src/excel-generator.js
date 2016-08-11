import util from './utility';
import PlatformType from './platform';
import officegen from 'officegen';
import fs from 'fs';

const logger = util.getLogger();

export function generateExcelReport(appReviewInfoList, platformType) {
  try {

    const fileNameWithoutExtension = platformType === PlatformType.APPSTORE ? 'AppStoreReviews' : 'GooglePlayReviews';
    logger.info(`Start generate ${fileNameWithoutExtension}`);
    const xlsx = officegen('xlsx');

    for (const appReviewInfo of appReviewInfoList) {
      const worksheet = xlsx.makeNewSheet();
      worksheet.name = appReviewInfo.name;
      worksheet.data[0] = ['date', 'title', 'content', 'rating', 'version', 'author'];
      appReviewInfo.reviews.forEach((review, index) => {  
        worksheet.data[index + 1] = [review.date, review.title, review.content, parseInt(review.rating, 10), review.version, review.author];
      });
    }
   
    const out = fs.createWriteStream(`${__dirname}/../out/${fileNameWithoutExtension}.xlsx`);
    logger.info(`Finished generate ${fileNameWithoutExtension}`);
    out.on('error', (error) => {
      logger.error(error);
    });
    xlsx.generate(out);

  } catch (error) {
    logger.error(error);
  }
}
