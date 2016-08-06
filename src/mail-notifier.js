import 'babel-polyfill';// for async/await
import nodemailer from 'nodemailer';
import config from '../config';
import util from './utility';
import Scraper from './scraper';

function isTodaysReview(review, index, array) {
  return new Date(review.date) > util.getYesterday();
}

async function sendMailAsnc(subject, mailBody) {
  const transporter = nodemailer.createTransport('SMTP', {
    host: config.host,
    port: config.port
  });
  
  const mailOptions = {
    from: config.mail.fromAddress,
    to: config.mail.toAddress,
    subject: subject,
    text: mailBody
  };

  await transporter.sendMail(mailOptions);
}

async function reportAsync(appInfoList, fetchFunc, mailSubject) {
  try {
    let mailBody = '';
    let hasNewReviews= false;
    const LF = '\n';
  
    for(const appInfo of appInfoList) {
      const reviews = await fetchFunc(appInfo.id);
      // 昨日以降のレビューを新着レビューとして判定する。
      const reviewsOfToday = reviews.filter(isTodaysReview);
      if (reviewsOfToday.length > 0) {
        mailBody += LF + '■' + appInfo.name + LF;
        reviewsOfToday.forEach((review) => {
          hasNewReviews = true;
          mailBody += 'date: ' + review.date + LF
                   + 'title: ' + review.title + LF
                   + 'content: ' + review.content + LF
                   + 'version: ' + review.version + LF
                   + 'author: ' + review.author + LF
                   + '------------------------------' + LF;
        });
      }
    }

    if (hasNewReviews) {
      console.log(mailBody);
      // await sendMailAsnc(mailSubject, mailBody);
    } else {
      console.log(mailSubject + 'はありませんでした。');
    }

  } catch (error) {
    console.log('Error:', error);
  }
}

async function main() {
  const scraper = new Scraper();
  await Promise.all([
    reportAsync(config.appStore, scraper.fetchReviewFromAppStore, 'AppStore新着レビュー'),
    reportAsync(config.googlePlay, scraper.fetchReviewFromGooglePlay, 'GooglePlay新着レビュー')
  ]);
}

main();