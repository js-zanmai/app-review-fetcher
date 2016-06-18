var 
  config = require('./config'),
  util = require('./utility');

function send(subject, mailBody) {
  var
    nodemailer = require('nodemailer'),
    transporter = nodemailer.createTransport(''),// TODO
    mailOptions = {
      from: config.mail.from,
      to: config.mail.to,
      subject: subject,
      text: mailBody
    };

  return transporter.sendMail(mailOptions);
}

function main() {
  var scraper = require('./scraper');

  return scraper.fetchReviewFromAppStore(config.appStore.id).then(function(reviews) {
    var
      LF = '\n',
      mailBody = '■ AppStore' + LF,
      hasNewReview = false;

    reviews.forEach(function(review) {
      // 昨日以降のレビューを新着レビューとして判定する。
      if (new Date(review.date) > util.getYesterday()) {
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
