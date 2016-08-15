import PlatformType from './platform';
import officegen from 'officegen';
import fs from 'fs';
import path from 'path';

export default class ExcelGenerator {

  constructor(logger) {
    this.logger = logger;
  }

  generate(appReviewInfoList, platformType, outputFolder) {
    try {      
      const fileNameWithoutExtension = platformType === PlatformType.APPSTORE ? 'AppStoreReviews' : 'GooglePlayReviews';
      this.logger.info(`Start generate ${fileNameWithoutExtension}`);
      const xlsx = officegen('xlsx');
      
      for (const appReviewInfo of appReviewInfoList) {
        const worksheet = xlsx.makeNewSheet();
        worksheet.name = appReviewInfo.name;
        worksheet.data[0] = ['date', 'title', 'content', 'rating', 'version', 'author'];
        appReviewInfo.reviews.forEach((review, index) => {  
          worksheet.data[index + 1] = [review.date, review.title, review.content, parseInt(review.rating, 10), review.version, review.author];
        });
      }

      const absPath = path.join(outputFolder, `${fileNameWithoutExtension}.xlsx`);
      const out = fs.createWriteStream(absPath);
      this.logger.info(`Finished generate ${fileNameWithoutExtension}`);
      out.on('error', (error) => { this.logger.error(error); });
      xlsx.generate(out);

    } catch (error) {
      this.logger.error(error);
    }

  }
}

