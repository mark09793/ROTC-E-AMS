// Initialize JSON file store and ensure default admin exists
const store = require('./store');

store.getState(); // side effect: creates data.json and default admin if needed

module.exports = store;
