import assert from 'power-assert';
import util from '../src/utility';
import PlatformType from '../src/platform';
import Review from '../src/review';
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

        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
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
        const reviewMap = new Map();
        reviewMap.set('hoge', [todayReview]);
        reviewMap.set('moge', [yesterdayReview]);
        const mailNotifier = new MailNotifier(new DummyLogger());
        mailNotifier.sendMailAsync = (subject, mailBody) => {
          assert(subject === test.subject);
          assert(typeof mailBody === 'string');
        };
        // Act & Assert
        mailNotifier.notifyAsync(reviewMap, test.platformType);
      });
    });

    tests.forEach((test) => {
      it(`should not be notified ${test.subject}`, () => {
        // Arrange
        const mailNotifier = new MailNotifier(new DummyLogger());
        let wasCalled = false;
        mailNotifier.sendMailAsync = () => { wasCalled = true; };
        // Act
        mailNotifier.notifyAsync([], test.platformType);
        // Assert
        assert(wasCalled === false);
      });
    });
  });

  describe('#rating2star()', () => {
    const tests = [
      {rating: 5, expected: '★★★★★'},
      {rating: 4, expected: '★★★★☆'},
      {rating: 3, expected: '★★★☆☆'},
      {rating: 2, expected: '★★☆☆☆'},
      {rating: 1, expected: '★☆☆☆☆'}
    ];

    tests.forEach((test) => {
      it(`shoud be converted to ${test.expected}`, () => {
        const mailNotifier = new MailNotifier(new DummyLogger());
        assert(mailNotifier.rating2star(test.rating) === test.expected);
      });
    });
  });
});