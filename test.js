var 
  scraper = require('./scraper'),
  appStoreId = 982091927,
  googlePlayId = "jp.co.fujixerox.mcopy";

scraper.fetchReviewFromAppStore(appStoreId).then(function(reviews) {
  console.log("■AppStore")
  reviews.forEach(function(review) {
    console.log("-----------------------------------------------------------");
    console.log("date: " + review.date);
    console.log("title: " + review.title);
    console.log("content: " + review.content);
    console.log("rating: " + review.rating);
    console.log("version: " + review.version);
    console.log("author: " + review.author);
  });
  return scraper.fetchReviewFromGooglePlay(googlePlayId);
}).then(function(review) {
  console.log("");
  console.log("■GooglePlay");
  console.log(review);
}).catch(function(error) {
  console.log("Error:", error);
});