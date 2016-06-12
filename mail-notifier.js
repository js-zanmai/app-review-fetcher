function send(subject, mailBody) {
  var 
    nodemailer = require('nodemailer'),
    transporter = nodemailer.createTransport(''),// TODO
    mailOptions = {
      from: '',
      to: '',
      subject: subject,
      text: mailBody
    };

  return transporter.sendMail(mailOptions);
}

function main() {
  var
    scraper = require('./scraper'),
    appStoreId = 982091927;

  return scraper.fetchReviewFromAppStore(appStoreId).then(function(reviews) {
    var 
      LF = "\n",
      mailBody = "■ AppStore" + LF,
      now = new Date(),
      yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      hasNewReview = false;

    reviews.forEach(function(review) {
      // 昨日以降のレビューを新着レビューとして判定する。
      if (new Date(review.date) > yesterday) {
        hasNewReview = true;
        mailBody += "-----------------------------------------------------------" + LF
                 + "date: " + review.date + LF
                 + "title: " + review.title + LF
                 + "content: " + review.content + LF
                 + "version: " + review.version + LF
                 + "author: " + review.author + LF;
      }
    });
  
    if (hasNewReview) {
      console.log(mailBody);
      //return send("AppStore新着レビュー", mailBody);
    } else {
     console.log("新着レビューはありませんでした。");
    }
  }).catch(function(error) {
    console.log("Error:", error);
  });
}

main();
