import assert from 'power-assert';
import Review from '../src/review';
import AppReviewInfo from '../src/app-review-info';

describe('app-review-info', () => {
  describe('#constructor()', () => {
    it('should initialized properties', () => {
      // Arrange
      const id = 'id';
      const updated = '2016/01/01';
      const title = 'title';
      const content = 'content';
      const rating = 5;
      const version = 1.0;
      const author = 'author';
      const reviews = [new Review(id, updated, title, content, rating, version, author)];
      const appName = 'hoge';
      // Act
      const appReviewInfo = new AppReviewInfo(appName, reviews);
      // Assert
      assert(appReviewInfo.name === appName);
      assert(appReviewInfo.reviews === reviews);
    });
  });
});