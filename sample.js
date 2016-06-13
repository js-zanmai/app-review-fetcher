const scraper = require('./scraper');
const config = require('./config');
 
scraper.fetchReviewFromAppStore(config.appStore.id).then(function(reviews) {
  console.log('■ AppStore');
  reviews.forEach(function(review) {
    console.log('-----------------------------------------------------------');
    console.log('date: ' + review.date);
    console.log('title: ' + review.title);
    console.log('content: ' + review.content);
    console.log('rating: ' + review.rating);
    console.log('version: ' + review.version);
    console.log('author: ' + review.author);
  });
  return scraper.fetchReviewFromGooglePlay(config.googlePlay.id);
}).then(function(reviews) {
  console.log('■ GooglePlay');
  reviews.forEach(function(review) {
    console.log('-----------------------------------------------------------');
    console.log('date: ' + review.date);
    console.log('title: ' + review.title);
    console.log('content: ' + review.content);
    console.log('rating: ' + review.rating);
    console.log('version: ' + review.version);
    console.log('author: ' + review.author);
  });
}).catch(function(error) {
  console.log('Error:', error);
});