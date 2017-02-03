import assert from 'power-assert';
import util from '../src/utility';
import Review from '../src/review';
import MailNotifier from '../src/mail-notifier';
import DummyLogger from './dummy-logger';

describe('MailNotifier', () => {
  describe('#notifyAsync', () => {

    it('should be notified', () => {
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
      const expectedSubject = '新着レビュー';
      const mailNotifier = new MailNotifier(new DummyLogger());
      mailNotifier.sendMailAsync = (subject, mailBody) => {
        assert(subject === expectedSubject);
        assert(typeof mailBody === 'string');
      };
      // Act & Assert
      mailNotifier.notifyAsync(reviewMap, expectedSubject);
    });

    it('should not be notified', () => {
      // Arrange
      const mailNotifier = new MailNotifier(new DummyLogger());
      let wasCalled = false;
      mailNotifier.sendMailAsync = () => { wasCalled = true; };
      // Act
      mailNotifier.notifyAsync(new Map(), 'hoge');
      // Assert
      assert(wasCalled === false);
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