import 'babel-polyfill';// for async/await
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import config from '../config';
import PlatformType from './platform';
import util from './utility';

const logger = util.getLogger();

async function sendMailAsync(subject, mailBody) {
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

  logger.info(`Start sending mail ${subject}`);
  await transporter.sendMail(mailOptions);
  logger.info(`Finished sending mail ${subject}`);
}

export async function notifyAsync(appReviewInfoList, platformType) {
  try {
    let mailBody = '';
    let hasNewReviews = false;
    const LF = '\n';
    const yesterday = util.getYesterday();
    const mailSubject = platformType === PlatformType.APPSTORE ? '【AppStore新着レビュー】' : '【GooglePlay新着レビュー】';

    for (const appReviewInfo of appReviewInfoList) {
      // 昨日以降のレビューを新着レビューとして判定する。
      const reviewsOfToday = appReviewInfo.reviews.filter((review) => {
        return new Date(review.date) > yesterday;
      });

      if (reviewsOfToday.length > 0) {
        mailBody += `${LF}■${appReviewInfo.name}${LF}`
                 + `------------------------------${LF}`;
        reviewsOfToday.forEach((review) => {          
          hasNewReviews = true;
          mailBody += `date: ${review.date}${LF}title: ${review.title}${LF}`
                   + `content: ${review.content}${LF}`
                   + `version: ${review.version}${LF}`
                   + `author: '${review.author}${LF}`
                   + `------------------------------${LF}`;
        });
      }
    }

    if (hasNewReviews) {
      logger.info(`New arrivals!!! [subject] ${mailSubject} [body] ${mailBody}`);
      await sendMailAsync(mailSubject, mailBody);
    } else {
      logger.info(`${mailSubject} is nothing`);
    }

  } catch (error) {
    logger.error(error);
  }
}