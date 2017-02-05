import assert from 'power-assert';
import util from '../src/utility';
import Review from '../src/review';

describe('utility', () => {
  describe('#zeroPadding()', () => {
    it('should be padded', () => {
      assert(util.zeroPadding('5') === '05');
      assert(util.zeroPadding('5', 3) === '005');
    });

    it('should not be padded if the second argument is the same as the number of entered characters', () => {
      assert(util.zeroPadding('5', 1) === '5');
      assert(util.zeroPadding('0', 1) === '0');
      assert(util.zeroPadding('05') === '05');
    });
  });
  
  describe('#getLogger()', () => {
    it('shoud be initialized logger instance', () => {
      const logger = util.getLogger();
      assert(logger !== undefined);
      assert(logger !== null);
    });
  });

  describe('#filterRecentReviews()', () => {
    it('shoud be filtered recent reviews', () => {
      const dateToStr = (date) => `${date.getFullYear()}/${util.zeroPadding(date.getMonth() + 1)}/${util.zeroPadding(date.getDate())}`;
      const id = 'id';
      const title = 'title';
      const content = 'content';
      const rating = 5;
      const version = 1.0;
      const author = 'author';
      const date = new Date();
      const updated1 = dateToStr(date);
      date.setDate(date.getDate() - 2); // 2日前までのレビューはメール通知の対象
      const updated2 = dateToStr(date);
      date.setDate(date.getDate() - 3); // 3日前のレビューはフィルタリングされる
      const updated3 = dateToStr(date);
      const r1 = new Review(id, updated1, title, content, rating, version, author);
      const r2 = new Review(id, updated2, title, content, rating, version, author);
      const r3 = new Review(id, updated3, title, content, rating, version, author);
      const reviews = [r1, r2, r3];
      const extracted = util.filterRecentReviews(reviews);
      assert(extracted.length === 2);
    });
  });
});