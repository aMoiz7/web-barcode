const { Category } = require('@mui/icons-material');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  productCode: String,
  price: Number,
  category:String
});

module.exports = mongoose.model('Product', productSchema);
