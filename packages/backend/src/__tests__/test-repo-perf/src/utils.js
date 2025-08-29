
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

module.exports = { formatDate, validateEmail };
  