import assert from 'power-assert';
import Review from '../src/review';

describe('review', () => {
  describe('#constructor()', () => {
    it('shoul be initialized', () => {
      const id = 'id';
      const updated = '2016/01/01';
      const title = 'title';
      const content = 'content';
      const rating = 5;
      const version = 1.0;
      const author = 'author';
      const review = new Review(id, updated, title, content, rating, version, author);
      assert(review.id === id);
      assert(review.date === updated);
      assert(review.title === title);
      assert(review.content === content);
      assert(review.rating === rating);
      assert(review.version === version);
      assert(review.author === author);
    });
  });
});