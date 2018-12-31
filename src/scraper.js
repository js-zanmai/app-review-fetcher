import 'babel-polyfill';// for async/await
import R from 'ramda';
import requestLib from 'request';
import cheerio from 'cheerio';
import client from 'cheerio-httpcli';
import util from './utility';
import Review from './review';

class Scraper {
  constructor(logger) {
    this.logger = logger;
  }

  async fetchAsync(id) {
    throw new TypeError(`Do not call abstract method, Can not fetch id = ${id}.`);
  }
}

class AppStoreScraper extends Scraper {

  constructor(logger) {
    super(logger);
  }

  async fetchAsync(id) {
    this.logger.info(`Start fetching from AppStore. [id] = ${id}`);

    return new Promise((resolve, reject) => {
      const RSS = `https://itunes.apple.com/jp/rss/customerreviews/id=${id}/xml`;
      const reviews = [];
      let done = false;

      const fetchRecursive = (url) => {
        return client.fetch(url).then((result) => {
          const $ = result.$;
          const firstPage = $('link[rel=first]').attr('href');
          const nextPage = $('link[rel=next]').attr('href');
          const lastPage = $('link[rel=last]').attr('href');

          $('feed > entry').each((i, element) => {
            if (!R.contains(id, R.map(x => x.id, reviews))) {
              reviews.push(this.parse($(element)));
            }
          });

          if (done || !nextPage || (firstPage === lastPage)) {
            return reviews;
          }

          // 次のページが最終ページであればフラグを立てておき、クロールを止めるようにする。
          done = nextPage === lastPage;
          // linkタグをクロールすることで過去のレビューを再帰的に取得する。
          return fetchRecursive(nextPage);
        }).catch((err) => {
          this.logger.error(err);
          reject(err);
        });
      };

      fetchRecursive(RSS).then((result) => {
        this.logger.info(`End fetching from AppStore. [id] = ${id}`);
        resolve(result);
      });
    });
  }

  parse($entry) {
    const id = $entry.find('id').text();
    const date = $entry.find('updated').text().replace(/(.*?)-(.*?)-(.*?)T(.*?)-.*/, '$1/$2/$3 $4');
    const title = $entry.find('title').text();
    const content = $entry.find('content[type=text]').text();
    const rating = $entry.find('im\\:rating').text(); // :はエスケープしないとエラーになるので注意。
    const version = $entry.find('im\\:version').text();
    const author = $entry.find('author > name').text();
    return new Review(id, date, title, content, rating, version, author);
  }

}

class GooglePlayScraper extends Scraper {

  constructor(logger) {
    super(logger);
  }

  async fetchAsync(id) {
    this.logger.info(`Start fetching from GooglePlay. [id] = ${id}`);
    let allReviews = [];
    let page = 0;
    const maxCountPerPage = 40;// 1リクエストあたり最大40件取得できる。

    while (true) {
      const tmpReviews = await this.fetchBodyAsync(id, page);
      allReviews = allReviews.concat(tmpReviews);
      page++;

      if (tmpReviews.length < maxCountPerPage) {
        this.logger.info(`End fetching from GooglePlay. [id] = ${id}, [page] = ${page}`);
        break;
      }
    }

    return allReviews;
  }

  async fetchBodyAsync(id, page) {
    const params = {
      method: 'POST',
      uri: 'https://play.google.com/store/getreviews',
      form: {
        pageNum: page,
        id: id,
        reviewSortOrder: 0,
        hl: 'jp',
        reviewType: 0,
        xhr: 1
      },
      json: true
    };

    const responseBody = await this.doRequestAsync(params);
    const content = JSON.parse(responseBody.slice(6));
    const targetHtml = content[0][2];
    return this.parse(cheerio.load(targetHtml));
  }

  doRequestAsync(params) {
    return new Promise((resolve, reject) => {
      requestLib(params, (error, response, body) => {
        if (error) {
          this.logger.error(error);
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  parse($) {
    const reviews = [];
    $('div.review-link').remove();
    $('.single-review').each((i, element) => {
      const reviewInfo = $(element).find('.review-info');
      const id = $(element).find('.review-header').attr('data-reviewid');
      const tmpDate = $(reviewInfo).find('.review-date').text().match(/(.*)年(.*)月(.*)日/);
      const updated = tmpDate[1] + '/' + util.zeroPadding(tmpDate[2]) + '/' + util.zeroPadding(tmpDate[3]);
      const rating = $(reviewInfo).find('.review-info-star-rating .tiny-star').attr('aria-label').match(/5つ星のうち(.*)つ星で評価しました/)[1];
      const reviewBody = $(element).find('.review-body.with-review-wrapper');
      const title = $(reviewBody).find('.review-title').text();
      const content = $(reviewBody).text().replace(title, '').trim();
      const author = $(reviewInfo).find('.author-name').text().trim();
      reviews.push(new Review(id, updated, title, content, rating, '-', author));
    });

    return reviews;
  }

}

export {
  AppStoreScraper,
  GooglePlayScraper
};