import { expect } from 'chai';
import util from '../src/utility';
import PlatformType from '../src/platform';
import Review from '../src/review';
import AppReviewInfo from '../src/app-review-info';
import MailNotifier from '../src/mail-notifier';
import DummyLogger from './dummy-logger';

describe('MailNotifier', () => {
  describe('#notifyAsync', () => {

    const tests = [
      {platformType: PlatformType.APPSTORE, subject: '【AppStore新着レビュー】'},
      {platformType: PlatformType.GOOGLEPLAY, subject: '【GooglePlay新着レビュー】'}
    ];

    tests.forEach((test) => {
      it(`should be notified ${test.subject}`, () => {
        
        // Arrange
        const now = new Date();
        const dateToStr = (date) => { 
          return `${date.getFullYear()}/${util.zeroPadding(date.getMonth() + 1)}/${util.zeroPadding(date.getDate())}`; 
        };

        const yesterday = util.getYesterday();
        const todayStr = dateToStr(now);
        const yesterdayStr = dateToStr(yesterday);
        const id = 'id';
        const title = 'title';
        const content = 'content';
        const rating = 5;
        const version = 1.0;
        const author = 'author';
        const todayReview = new Review(id, todayStr, title, content, rating, version, author);
        const yesterdayReview = new Review(id, yesterdayStr, title, content, rating, version, author);
        const appReviewInfoList = [new AppReviewInfo('hoge', [todayReview]), new AppReviewInfo('moge', [yesterdayReview])];
        const mailNotifier = new MailNotifier(new DummyLogger());
        mailNotifier.sendMailAsync = (subject, mailBody) => {
          expect(subject).to.equal(test.subject);
          expect(mailBody).to.be.a('string');
        };
        // Act & Assert
        mailNotifier.notifyAsync(appReviewInfoList, test.platformType);
      });
    });

    tests.forEach((test) => {
      it(`should not be notified ${test.subject}`, () => {
        
        // Arrange
        const dateToStr = (date) => { 
          return `${date.getFullYear()}/${util.zeroPadding(date.getMonth() + 1)}/${util.zeroPadding(date.getDate())}`; 
        };

        const yesterday = util.getYesterday();
        const yesterdayStr = dateToStr(yesterday);
        const id = 'id';
        const title = 'title';
        const content = 'content';
        const rating = 5;
        const version = 1.0;
        const author = 'author';
        const yesterdayReview1 = new Review(id, yesterday, title, content, rating, version, author);
        const yesterdayReview2 = new Review(id, yesterdayStr, title, content, rating, version, author);
        const appReviewInfoList = [new AppReviewInfo('hoge', [yesterdayReview1]), new AppReviewInfo('moge', [yesterdayReview2])];
        const mailNotifier = new MailNotifier(new DummyLogger());
        let wasCalled = false;
        mailNotifier.sendMailAsync = (subject, mailBody) => {
          wasCalled = true;
        };
        // Act
        mailNotifier.notifyAsync(appReviewInfoList, test.platformType);
        // Assert
        expect(wasCalled).to.be.false;
      });
    });
  });
});