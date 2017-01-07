import assert from 'power-assert';
import util from '../src/utility';

describe('utility', () => {
  describe('#zeroPadding()', () => {
    it('第二引数に指定した文字数となるように左側から0埋めする。', () => {
      assert(util.zeroPadding('5') === '05');
      assert(util.zeroPadding('5', 3) === '005');
    });

    it('第二引数に指定した文字数と入力された文字数が同じであれば、変更しない。', () => {
      assert(util.zeroPadding('5', 1) === '5');
      assert(util.zeroPadding('0', 1) === '0');
      assert(util.zeroPadding('05') === '05');
    });
  });
  
  describe('#getLogger()', () => {
    it('shoud initialized logger instance', () => {
      const logger = util.getLogger();
      assert(logger !== undefined);
      assert(logger !== null);
    });
  });
});