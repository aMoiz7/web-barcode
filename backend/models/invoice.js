// invoice.js

const mongoose = require('mongoose');

// Define the invoice schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  
  products: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      productPrice: {
        type: Number,
        required: true,
      },
      originalPrice: {
        type: Number,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Invoice model
const Invoice = mongoose.model('Invoice', invoiceSchema);

// Export the model
module.exports = Invoice;
