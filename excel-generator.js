function main() {
  var 
    scraper = require('./scraper'),
    config = require('./config'),
    fs = require('fs'),
    officegen = require('officegen'),
    xlsx = officegen('xlsx');
 
  function writeWorksheet(sheetName, reviews) {
    var worksheet = xlsx.makeNewSheet();
    worksheet.name = sheetName;
    worksheet.data[0] = ['date', 'title', 'content', 'rating', 'version', 'author'];
    reviews.forEach(function(review, index) {
      worksheet.data[index + 1] = [review.date, review.title, review.content, review.rating, review.version, review.author];
    });
  }

  scraper.fetchReviewFromAppStore(config.appStore.id).then(function(reviews) {
    writeWorksheet('AppStore', reviews);
    return scraper.fetchReviewFromGooglePlay(config.googlePlay.id);
  }).then(function(reviews) {
    writeWorksheet('GooglePlay', reviews);
  }).then(function() {
    var out = fs.createWriteStream('AppReviews.xlsx');
    out.on('error', function(error) {
      console.log(error);
    });
    xlsx.generate(out);
  }).catch(function(error) {
    console.log('Error:', error);
  });
}

main();