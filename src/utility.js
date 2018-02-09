import log4js from 'log4js';

export default class Utility {

  static zeroPadding(number, length = 2) {
    return (Array(length).join('0') + number).slice(-length);
  }
  
  static getLogger() {
    log4js.configure(`${__dirname}/../log4js.json`);
    return log4js.getLogger('default');
  }

  static sleep(ms = 1000) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  // 稀に古いレビューが返ってくることがあったため、直近３日以内のレビューを新着レビューと判定する。
  static filterRecentReviews(reviews) {
    const now = new Date();
    const threeDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
    return reviews.filter((review) => {
      const date = new Date(review.date);
      return date.getTime() >= threeDaysAgo.getTime();
    });
  }

}