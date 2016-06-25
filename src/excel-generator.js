import Scraper from './scraper';
import config from '../config';
import officegen from 'officegen';
import fs from 'fs';

const scraper = new Scraper(); 
const xlsx = officegen('xlsx');
const writeWorksheet = (sheetName, reviews) => {
  const worksheet = xlsx.makeNewSheet();
  worksheet.name = sheetName;
  worksheet.data[0] = ['date', 'title', 'content', 'rating', 'version', 'author'];
  reviews.forEach((review, index) => {
    worksheet.data[index + 1] = 
    [review.date, review.title, review.content, parseInt(review.rating, 10), review.version, review.author];
  });
};

scraper.fetchReviewFromAppStore(config.appStore.id).then((reviews) => {
  writeWorksheet('AppStore', reviews);
  return scraper.fetchReviewFromGooglePlay(config.googlePlay.id);
}).then((reviews) => {
  writeWorksheet('GooglePlay', reviews);
}).then(() => {
  const out = fs.createWriteStream('AppReviews.xlsx');
  out.on('error', (error) => {
    console.log(error);
  });
  xlsx.generate(out);
}).catch((error) => {
  console.log('Error:', error);
});
