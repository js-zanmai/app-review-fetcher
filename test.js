var scraper = require('./scraper');

var id = 982091927;
scraper.fetchReviewFromAppStore(id).then(function(reviews) {
  reviews.forEach(function(review) {
    console.log("-----------------------------------------------------------");
    console.log("date: " + review.date);
    console.log("title: " + review.title);
    console.log("content: " + review.content);
    console.log("rating: " + review.rating);
    console.log("version: " + review.version);
    console.log("author: " + review.author);
  });
}).catch(function(error) {
  console.log("Error:", error);
});