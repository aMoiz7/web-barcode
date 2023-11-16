const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');

const adminRouter = require('./routes/admin-router');
const addProduct = require('./routes/add-products');
require('dotenv').config();

const cookieParser = require('cookie-parser');

const app = express();

const options = {
  key: fs.readFileSync(path.join(__dirname, '../public/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../public/cert.pem')),
};
const server = https.createServer(options, app);

// Connect to MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/costumercontacts?directConnection=true', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use bodyParser to parse JSON requests
app.use(bodyParser.json());

// Enable CORS for all requests
// app.use(cors({
//   origin: [ 'https://192.168.209.1:3000','https://localhost:3000'],
//   credentials: true,
// }));

app.use(cookieParser());

// Define routes for the API
app.use('/api/customers', require('./routes/costumers'));
app.use('/api/admin', adminRouter);
app.use('/api/product', addProduct);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
const port = process.env.PORT || 7000;
server.listen(port,  () => console.log(`Server listening on port ${port}...`));
