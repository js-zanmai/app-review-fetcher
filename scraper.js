const client = require('cheerio-httpcli');

function fetchReviewFromAppStore(id) {
  const RSS = 'https://itunes.apple.com/jp/rss/customerreviews/id=' + id + '/xml';
  let reviews = [];
  let isFinished = false;
  
  return new Promise(function(resolve, reject) {
    function fetchRecursive(url) {
      return client.fetch(url).then(function(result) {
        const $ = result.$;
        const firstPage = $('link[rel=first]').attr('href');
        const nextPage = $('link[rel=next]').attr('href');
        const lastPage = $('link[rel=last]').attr('href');
        const entries = $('feed > entry');
        
        entries.each(function(id) {
          const entry = $(this);
          if (id == 0) { return; }// 最初のentryタグは関係ないのでスキップする。
          reviews.push({
            date: entry.find('updated').text().replace(/(.*?)-(.*?)-(.*?)T(.*?)-.*/, '$1/$2/$3 $4'),
            title: entry.find('title').text(),
            content: entry.find('content[type=text]').text(),
            rating: entry.find('im\\:rating').text(),// :はエスケープしないとエラーになるので注意。
            version: entry.find('im\\:version').text(),
            author: entry.find('author > name').text()
          });
        });

        if (isFinished || !nextPage || (firstPage == lastPage)) {
          return reviews;
        }
        
        // 次のページが最終ページであればフラグを立てておき、クロールを止めるようにする。
        isFinished = nextPage == lastPage;
        // linkタグをクロールすることで過去のレビューを再帰的に取得する。
        return fetchRecursive(nextPage);
      }).catch(function(error) {
        reject(error);
      });
    }

    fetchRecursive(RSS).then(function(result) {
      resolve(result);
    });
  });
}

// TODO 未実装。GooglePlayはHTMLをスクレイピングしないとダメっぽい。
function fetchReviewFromGooglePlay(id) {
  const URL = 'https://play.google.com/store/apps/details?id=' + id;
  let reviews = [];
  
  client.fetch(URL).then(function(result) {

  });
  return new Promise(function(resolve, reject) {
    resolve(reviews);
  });
}

module.exports.fetchReviewFromAppStore = fetchReviewFromAppStore;
module.exports.fetchReviewFromGooglePlay = fetchReviewFromGooglePlay;