const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10

  },
  date:{
    type: Date,
    required: true,
    default: Date.now
  }
});


module.exports = mongoose.model('Customer', customerSchema);
