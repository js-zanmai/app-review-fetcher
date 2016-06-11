'use strict';

var fetchReviewFromAppStore = function (id) {
  var
    client = require('cheerio-httpcli'),
    reviews = [],
    RSS = "https://itunes.apple.com/jp/rss/customerreviews/id=" + id + "/xml",
    isFinished = false;
  
  return new Promise(function(resolve, reject) {
    function fetchRecursive(url) {
      return client.fetch(url).then(function(result) {
        var
          $ = result.$,
          nextPage = $("link[rel=next]").attr("href"),
          lastPage = $("link[rel=last]").attr("href"),
          entries = $("feed > entry");

        entries.each(function(id) {
          var entry = $(this);
          if (id == 0) { return; }// 最初のentryタグは関係ないのでスキップする。
          reviews.push({
            date: entry.find("updated").text().replace(/(.*?)-(.*?)-(.*?)T(.*?)-.*/, "$1/$2/$3 $4"),
            title: entry.find("title").text(),
            content: entry.find("content[type=text]").text(),
            rating: entry.find("im\\:rating").text(),// :はエスケープしないとエラーになるので注意。
            version: entry.find("im\\:version").text(),
            author: entry.find("author > name").text()
          });
        });

        if (isFinished) {
          return reviews;
        } else {
          // 次のページが最終ページであればフラグを立てておき、クロールを止めるようにする。
          isFinished = nextPage == lastPage;
          // linkタグをクロールすることで過去のレビューを再帰的に取得する。
          return fetchRecursive($("link[rel=next]").attr("href"));
        }
      }).catch(function(error) {
        reject(error);
      });
    }

    fetchRecursive(RSS).then(function(result) {
      resolve(result);
    });
  });
}

module.exports.fetchReviewFromAppStore = fetchReviewFromAppStore;
