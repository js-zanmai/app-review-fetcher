const config = require('./config');

function send(subject, mailBody) {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport('');// TODO
  const mailOptions = {
    from: config.mail.from,
    to: config.mail.to,
    subject: subject,
    text: mailBody
  };

  return transporter.sendMail(mailOptions);
}

function main() {
  const scraper = require('./scraper');

  return scraper.fetchReviewFromAppStore(config.appStore.id).then(function(reviews) {
    const LF = '\n';
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    let mailBody = '■ AppStore' + LF;
    let hasNewReview = false;

    reviews.forEach((review) => {
      // 昨日以降のレビューを新着レビューとして判定する。
      if (new Date(review.date) > yesterday) {
        hasNewReview = true;
        mailBody += '-----------------------------------------------------------' + LF
                 + 'date: ' + review.date + LF
                 + 'title: ' + review.title + LF
                 + 'content: ' + review.content + LF
                 + 'version: ' + review.version + LF
                 + 'author: ' + review.author + LF;
      }
    });
  
    if (hasNewReview) {
      console.log(mailBody);
      //return send("AppStore新着レビュー", mailBody);
    } else {
      console.log('新着レビューはありませんでした。');
    }
  }).catch(function(error) {
    console.log('Error:', error);
  });
}

main();
