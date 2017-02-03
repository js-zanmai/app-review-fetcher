import 'babel-polyfill';// for async/await
import R from 'ramda';
import nodemailer from 'nodemailer';
import config from '../config';
import Platform from './platform';

export default class MailNotifier {

  constructor(logger) {
    this.logger = logger;
  }

  async sendMailAsync(subject, mailBody) {
    const smtpConfig = {
      host: config.mail.host,
      port: config.mail.port
    };

    const transporter = nodemailer.createTransport(smtpConfig);
    const mailOptions = {
      from: config.mail.fromAddress,
      to: config.mail.toAddress.join(', '),
      subject: subject,
      text: mailBody
    };

    this.logger.info(`Start sending mail ${subject}`);
    await transporter.sendMail(mailOptions);
    this.logger.info(`Finished sending mail ${subject}`);
  }

  rating2star(rating) {
    return R.times((i) => i < rating ? '★' : '☆', 5).reduce((a, b) => a + b);
  }

  async notifyAsync(reviewMap, platform) {
    if (reviewMap.size === 0) {
      this.logger.info('New review is nothing');
      return;
    }

    try {
      let mailBody = '';
      const LF = '\n';
      const mailSubject = platform === Platform.APPSTORE ? '【AppStore新着レビュー】' : '【GooglePlay新着レビュー】';
      
      reviewMap.forEach((reviews, name) => {
        mailBody += `${LF}■${name}${LF}`
                 + `------------------------------${LF}`;
        reviews.forEach((review) => {
          mailBody += `Date:    ${review.date}${LF}`
                    + `Title:   ${review.title}${LF}`
                    + `Comment: ${review.content}${LF}`
                    + `Author:  ${review.author}${LF}`
                    + `Rating:  ${this.rating2star(review.rating)}${LF}`
                    + `Version: ${review.version}${LF}${LF}`
                    + `------------------------------${LF}`;
        });
      });

      this.logger.info(`New arrivals!!! [subject] ${mailSubject} [body] ${mailBody}`);
      await this.sendMailAsync(mailSubject, mailBody);

    } catch (error) {
      this.logger.error(error);
    }
  }
}

