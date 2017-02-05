import assert from 'power-assert';
import util from '../src/utility';

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
});