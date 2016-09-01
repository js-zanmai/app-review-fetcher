import 'babel-polyfill';// for async/await
import R from 'ramda';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import config from '../config';
import PlatformType from './platform';
import util from './utility';

export default class MailNotifier {

  constructor(logger) {
    this.logger = logger;
  }

  async sendMailAsync(subject, mailBody) {
    const smtpConfig = {
      host: config.mail.host,
      port: config.mail.port
    };

    const transporter = nodemailer.createTransport(smtpTransport(smtpConfig));
    const mailOptions = {
      from: config.mail.fromAddress,
      to: config.mail.toAddress,
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

  async notifyAsync(appReviewInfoList, platformType) {
    try {
      let mailBody = '';
      let hasNewReviews = false;
      const LF = '\n';
      const yesterday = util.getYesterday();
      const mailSubject = platformType === PlatformType.APPSTORE ? '【AppStore新着レビュー】' : '【GooglePlay新着レビュー】';

      for (const appReviewInfo of appReviewInfoList) {
        // 昨日以降のレビューを新着レビューとして判定する。
        const reviewsOfToday = appReviewInfo.reviews.filter((review) => new Date(review.date) >= yesterday);

        if (reviewsOfToday.length > 0) {
          mailBody += `${LF}■${appReviewInfo.name}${LF}`
                   + `------------------------------${LF}`;
          reviewsOfToday.forEach((review) => {
            hasNewReviews = true;
            mailBody += `date: ${review.date}${LF}`
                     + `title: ${review.title}${LF}`
                     + `content: ${review.content}${LF}`
                     + `author: ${review.author}${LF}`
                     + `rating: ${this.rating2star(review.rating)}${LF}`
                     + `version: ${review.version}${LF}`
                     + `------------------------------${LF}`;
          });
        }
      }

      if (hasNewReviews) {
        this.logger.info(`New arrivals!!! [subject] ${mailSubject} [body] ${mailBody}`);
        await this.sendMailAsync(mailSubject, mailBody);
      } else {
        this.logger.info(`${mailSubject} is nothing`);
      }

    } catch (error) {
      this.logger.error(error);
    }
  }
}

