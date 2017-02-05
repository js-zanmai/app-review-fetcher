import 'babel-polyfill';// for async/await
import R from 'ramda';
import nodemailer from 'nodemailer';

export default class MailNotifier {

  constructor(logger) {
    this.logger = logger;
  }

  async sendMailAsync(subject, mailBody, mailConfig) {
    const smtpConfig = {
      host: mailConfig.host,
      port: mailConfig.port
    };

    const transporter = nodemailer.createTransport(smtpConfig);
    const mailOptions = {
      from: mailConfig.fromAddress,
      to: mailConfig.toAddresses.join(', '),
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

  buildMessage(reviewMap) {
    let mailBody = '';
    const LF = '\n';
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
    return mailBody;
  }

  async notifyAsync(reviewMap, subject, mailConfig) {
    if (!mailConfig.IsEnabled) {
      this.logger.info('mail option is disabled.');
      return;
    }

    if (reviewMap.size === 0) {
      this.logger.info('New review is nothing.');
      return;
    }

    try {
      const mailBody = this.buildMessage(reviewMap);
      this.logger.info(`New arrivals!!! [subject] ${subject} [body] ${mailBody}`);
      await this.sendMailAsync(subject, mailBody, mailConfig);
    } catch (err) {
      this.logger.error(err);
    }
  }
}

