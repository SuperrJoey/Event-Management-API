const isPastDate = (dateString) => {
  return new Date(dateString) < new Date();
};

module.exports = { isPastDate };
