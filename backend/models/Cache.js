const mongoose = require('mongoose');

const cacheSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Expiry time in seconds (1 hour in this example)
  },
});

const Cache = mongoose.model('Cache', cacheSchema);

module.exports = Cache;