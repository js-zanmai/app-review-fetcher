import { expect } from 'chai';
import Review from '../src/review';

describe('review', () => {
  describe('#constructor()', () => {
    it('プロパティに値がセットされていること。', () => {
      const updated = '2016/01/01';
      const title = 'title';
      const content = 'content';
      const rating = 5;
      const version = 1.0;
      const author = 'author';
      const review = new Review(updated, title, content, rating, version, author);
      expect(review.date).to.equal(updated);
      expect(review.title).to.equal(title);
      expect(review.content).to.equal(content);
      expect(review.rating).to.equal(rating);
      expect(review.version).to.equal(version);
      expect(review.author).to.equal(author);
    });
  });
});