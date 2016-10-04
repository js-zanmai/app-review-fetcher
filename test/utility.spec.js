import { expect } from 'chai';
import util from '../src/utility';

describe('utility', () => {
  describe('#zeroPadding()', () => {
    it('第二引数に指定した文字数となるように左側から0埋めする。', () => {
      expect(util.zeroPadding('5')).to.equal('05');
      expect(util.zeroPadding('5', 3)).to.equal('005');
    });

    it('第二引数に指定した文字数と入力された文字数が同じであれば、変更しない。', () => {
      expect(util.zeroPadding('5', 1)).to.equal('5');
      expect(util.zeroPadding('0', 1)).to.equal('0');
      expect(util.zeroPadding('05')).to.equal('05');
    });
  });
  
  describe('#getLogger()', () => {
    it('shoud initialized logger instance', () => {
      const logger = util.getLogger();
      expect(logger).to.not.be.undefined;
      expect(logger).to.not.be.null;
    });
  });
});