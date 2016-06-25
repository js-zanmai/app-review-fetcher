import config from '../config';
import util from './utility';
import Scraper from './scraper';

const scraper = new Scraper();
const sendMail = (subject, mailBody) => {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport(''); // TODO
  const mailOptions = {
    from: config.mail.from,
    to: config.mail.to,
    subject: subject,
    text: mailBody
  };

  return transporter.sendMail(mailOptions);
};

scraper.fetchReviewFromAppStore(config.appStore.id).then((reviews) => {
  const LF = '\n';
  let mailBody = '■ AppStore' + LF;
  let hasNewReviews= false;

  reviews.forEach((review) => {
    // 昨日以降のレビューを新着レビューとして判定する。
    if (new Date(review.date) > util.getYesterday()) {
      hasNewReviews = true;
      mailBody += '-----------------------------------------------------------' + LF
                + 'date: ' + review.date + LF
                + 'title: ' + review.title + LF
                + 'content: ' + review.content + LF
                + 'version: ' + review.version + LF
                + 'author: ' + review.author + LF;
    }
  });

  if (hasNewReviews) {
    console.log(mailBody);
    // return send("AppStore新着レビュー", mailBody);
  } else {
    console.log('新着レビューはありませんでした。');
  }
}).catch((error) => {
  console.log('Error:', error);
});

