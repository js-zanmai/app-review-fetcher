function zeroPudding(val) {
  return ('0' + val).slice(-2);
}

function fetchReviewFromAppStore(id) {
  return new Promise(function(resolve, reject) {
    var
      client = require('cheerio-httpcli'),
      RSS = 'https://itunes.apple.com/jp/rss/customerreviews/id=' + id + '/xml',
      reviews = [],
      isFinished = false;

    function fetchRecursive(url) {
      return client.fetch(url).then(function(result) {
        var 
          $ = result.$,
          firstPage = $('link[rel=first]').attr('href'),
          nextPage = $('link[rel=next]').attr('href'),
          lastPage = $('link[rel=last]').attr('href');
        
        $('feed > entry').each(function(i, element) {
          var entry = $(element);
          if (i == 0) { return; }// 最初のentryタグは関係ないのでスキップする。
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

function fetchReviewFromGooglePlay(id) {
  return new Promise(function(resolve, reject) {
    var 
      client = require('cheerio-httpcli'),
      URL = 'https://play.google.com/store/apps/details?id=' + id,
      reviews = [];

    return client.fetch(URL).then(function(result) {
      var $ = result.$;

      $('div.review-link').remove();
      $('.single-review').each(function(i, element) {
        var 
          reviewInfo = $(element).find('.review-info'), 
          tmpDate = $(reviewInfo).find('.review-date').text().match(/(.*)年(.*)月(.*)日/),
          updated = tmpDate[1] + '/' + zeroPudding(tmpDate[2]) + '/' + zeroPudding(tmpDate[3]),
          rating = $(reviewInfo).find('.review-info-star-rating .tiny-star').attr('aria-label').match(/5つ星のうち(.*)つ星で評価しました/)[1],
          reviewBody = $(element).find('.review-body.with-review-wrapper'),
          title = $(reviewBody).find('.review-title').text(),
          content = $(reviewBody).text().replace(title, '').trim(),
          author = $(element).find('.author-name > a').text();

        reviews.push({
          date: updated,
          title: title,
          content: content,
          rating: rating,
          version: '-',
          author: author
        });
      });
      
      resolve(reviews);
    }).catch(function(error) {
      reject(error);
    });
  });
}

module.exports.fetchReviewFromAppStore = fetchReviewFromAppStore;
module.exports.fetchReviewFromGooglePlay = fetchReviewFromGooglePlay;