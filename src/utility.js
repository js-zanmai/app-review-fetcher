export default class Utility {

  static zeroPadding(number, length = 2) {
    return (Array(length).join('0') + number).slice(-length);
  }
  
  static getYesterday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  }
}