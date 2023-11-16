const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const Invoice = require('../models/invoice')
const { MongoClient } = require('mongodb');
const shortid = require('shortid');

require('dotenv').config();


// Get all customers
router.get('/Users', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/details', async (req, res) => {
  const { token } = req.query;
  console.log(token);

  try {
    // Verify and decode the token
    const decodedToken = jwt.decode(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Find the user in the customers collection based on the userId
    const user = await Customer.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// Create a new customer
router.post('/', async (req, res) => {
  const { name, phone } = req.body;
  
  // Check if the user already exists in the database
  const existingCustomer = await Customer.findOne({ name, phone });

  if (existingCustomer) {
    // User already exists, generate a new JWT token
    const token = jwt.sign({ id: existingCustomer._id }, process.env.JWT_SECRET);
    res.json({ jwt: token });
  } else {
    // User does not exist, save the user and generate a new JWT token
    const customer = new Customer({ name, phone });
    await customer.save();
    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET);
    res.json({ jwt: token });
  }
});

// Authentication middleware
const checkAuth = (req, res, next) => {
  // Get the JWT token from the request headers
  const token = req.headers.authorization;

  if (!token) {
    // If the token is not present, return an error response
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify the token and decode its payload
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // If the token is invalid, return an error response
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // If the token is valid, find the user in the database based on its ID
    Customer.findById(decoded.id, (err, customer) => {
      if (err || !customer) {
        // If the customer is not found, return an error response
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // If the customer is found, attach it to the request object and continue to the next middleware
      req.customer = customer;
      next();
    });
  });
};


// Route to access the main page (requires authentication)
router.get('/Scanner', checkAuth, (req, res) => {
  res.send(`Hello ${req.customer.name}, welcome to the main page!`); // Access the authenticated customer via req.customer
});




// Helper function to get the next available invoice number
// const getNextInvoiceNumber = async () => {
//   // Query the database to get the last invoice number
//   const lastInvoice = await Invoice.findOne({}, {}, { sort: { invoiceNumber: -1 } });
//   let nextInvoiceNumber = 1;

//   if (lastInvoice) {
//     // If there is a last invoice, increment the invoice number
//     nextInvoiceNumber = parseInt(lastInvoice.invoiceNumber) + 1;
//   }

//   return nextInvoiceNumber.toString();
// };


router.post('/invoice', (req, res) => {
  const { userId , userName, products } = req.body;
  const invoiceNumber = shortid.generate(); // Generate a unique invoice number

  const invoice = new Invoice({
    invoiceNumber,
    userId,
    userName,
    products,
  });

  invoice
    .save()
    .then((savedInvoice) => {
      res.status(200).json(savedInvoice);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error saving invoice' });
    });
});

//suggestions 
router.post('/lastInvoice', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Find the last invoice for the user by searching for the userId field
    const lastInvoice = await Invoice.findOne({ userId }).sort({ createdAt: -1 });

    if (!lastInvoice) {
      return res.status(404).json({ error: 'Last invoice not found' });
    }

    const scannedProducts = req.body.scannedProducts;
    if (!scannedProducts) {
      // If scannedProducts is empty, send an empty array as the missingProducts response
      return res.json({ missingProducts: [] });
    }

    const lastInvoiceProductNames = lastInvoice.products.map((invoiceProduct) => invoiceProduct.name);
    const scannedProductNames = scannedProducts.map((product) => product.product.name);

    const missingProducts = lastInvoiceProductNames.filter(
      (productName) => !scannedProductNames.includes(productName)
    );

    res.json({ missingProducts });
    console.log("missingProducts ", missingProducts);
  } catch (error) {
    console.error('Error fetching last invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



//


// Export the router
module.exports = router;

