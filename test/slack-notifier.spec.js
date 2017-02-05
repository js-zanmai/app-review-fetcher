import assert from 'power-assert';
import util from '../src/utility';
import Review from '../src/review';
import SlackNotifier from '../src/slack-notifier';
import DummyLogger from './dummy-logger';


class DummySlack {
  constructor() {
    this.wasCalled = false;
  }
  
  setWebhook(url) {
    this.wasCalled = true;
    this.url = url;
  }
  webhook(info) {
    this.info = info;
  }
}

describe('SlackNotifier', () => {
  let slacker;
  let dummySlack;
  let reviewForUT;

  beforeEach(() => {
    const now = new Date();
    const dateToStr = (date) => `${date.getFullYear()}/${util.zeroPadding(date.getMonth() + 1)}/${util.zeroPadding(date.getDate())}`;
    reviewForUT = new Review('id', dateToStr(now), 'title', 'content', 5, 1.0, 'author');
    dummySlack = new DummySlack();
    slacker = new SlackNotifier(new DummyLogger(), dummySlack);
  });

  describe('#notify', () => {
    it('should be notified', () => {
      // Arrange
      const reviewMap = new Map();
      reviewMap.set('hoge', [reviewForUT]);
      // Act & Assert
      slacker.notify(reviewMap, 'iOS', { use: true });
    });

    it('should not be notified when new review is nothing', () => {
      // Act
      slacker.notify(new Map(), 'iOS', { use: true });
      // Assert
      assert(dummySlack.wasCalled === false);
    });

    it('should not be notified when use = false', () => {
      // Arrange
      const reviewMap = new Map();
      reviewMap.set('hoge', [reviewForUT]);
      // Act
      slacker.notify(reviewMap, 'iOS', { use: false });
      // Assert
      assert(dummySlack.wasCalled === false);
    });
  });

  describe('#webhook()', () => {
    it('should be succesful', () => {
      const config = {
        webhook: 'dummyUrl',
        channel: 'dummyChannel'
      };
      const attachments = slacker.buildAttachments('App', reviewForUT, 'iOS');
      // Act
      slacker.webhook(attachments, config);
      // Assert
      assert(dummySlack.wasCalled === true);
      assert(dummySlack.url === config.webhook);
      assert(dummySlack.info.channel === '#' + config.channel);
      assert(dummySlack.info.attachments === attachments);
    });
  });

  describe('#buildAttachments()', () => {
    it('should be succesful', () => {
      // Act
      const attachments = slacker.buildAttachments('App', reviewForUT, 'iOS');
      // Assert
      assert(attachments.length === 1);
    });
  });

  describe('#buildFields()', () => {
    it('should be succesful', () => {
      // Act
      const fields = slacker.buildFields(reviewForUT, 'iOS');
      // Assert
      assert(fields.length === 5);
    });
  });

  describe('#buildStar()', () => {
    const tests = [
      {rating: 5, expected: ':star::star::star::star::star:'},
      {rating: 4, expected: ':star::star::star::star:'},
      {rating: 3, expected: ':star::star::star:'},
      {rating: 2, expected: ':star::star:'},
      {rating: 1, expected: ':star:'}
    ];

    tests.forEach((test) => {
      it(`shoud be converted to ${test.expected}`, () => {
        assert(slacker.buildStar(test.rating) === test.expected);
      });
    });
  });

  describe('#selectColor()', () => {
    const tests = [
      {rating: 5, expected: '#16A085'},
      {rating: 4, expected: '#66CC00'},
      {rating: 3, expected: '#999900'},
      {rating: 2, expected: '#EFA131'},
      {rating: 1, expected: '#990000'}
    ];

    tests.forEach((test) => {
      it(`shoud be converted to ${test.expected}`, () => {
        assert(slacker.selectColor(test.rating) === test.expected);
      });
    });
  });
});