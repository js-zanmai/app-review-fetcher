module.exports.zeroPadding = function(number, length) {
  return (Array(length).join('0') + number).slice(-length);
};

module.exports.getYesterday = function() {
  var now = new Date();
  return Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
};