export const zeroPadding = (number, length) => {
  return (Array(length).join('0') + number).slice(-length);
};

export const getYesterday = () => {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
};