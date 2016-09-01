import log4js from 'log4js';

export default class Utility {

  static zeroPadding(number, length = 2) {
    return (Array(length).join('0') + number).slice(-length);
  }
  
  static getLogger() {
    log4js.configure(`${__dirname}/../log4js.json`); 
    return log4js.getLogger('fileAppender');
  }
  
}