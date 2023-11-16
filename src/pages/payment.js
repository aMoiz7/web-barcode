import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { saveAs } from 'file-saver';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import '../payment.css'; 

// Register fonts with pdfmake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const PaymentForm = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCVV] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [UPI, setUPI] = useState('');
  const [Wallet, setWallet] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  useEffect(() => {
    const amount = Cookies.get('totalPrice');
    setPaymentAmount(amount);

    const token = Cookies.get('jwt');
    // Make a request to your server to get the user details using the token
    axios
      .get(`/api/customers/details?token=${token}`)
      .then((response) => {
        setUserDetails(response.data);
      })
      .catch((error) => {
        console.log('Error fetching user details:', error);
      });
  }, []);

  useEffect(() => {
    // Retrieve the scanned products from local storage
    const scannedProducts = JSON.parse(localStorage.getItem('scannedProducts'));
    console.log('Scanned Products:', scannedProducts);
    if (scannedProducts) {
      const products = scannedProducts.map((product, index) => ({
        barcode: product.barcode,
        product: {
          name: product.product.name,
          weight: product.product.weight,
          originalPrice: product.product.originalPrice,
          price: product.product.price,
          quantity: product.product.quantity,
        },
        cart: {
          items: [
            {
              productCode: product.productCode,
              quantity: product.quantity,
              price: product.price,
            },
          ],
        },
      }));
      console.log('Products:', products);
      setProducts(products);
    }
  }, []);

  const generateInvoicePDF = (invoice) => {
    const docDefinition = {
      content: [
        { text: 'Invoice', style: 'header' },
        { text: `Invoice Number: ${invoice.invoiceNumber}` },
        { text: `User Name: ${invoice.userName}` },
        { text: `Phone: ${invoice.phone}` },
        { text: 'Products', style: 'subheader' },
        {
          ul: invoice.products.map((product) => `${product.name} - Quantity: ${product.quantity} - Price: ${product.productPrice} - Original Price: ${product.originalPrice} - Weight: ${product.weight}`),
        },
        { text: `Total Amount: ${invoice.totalAmount}` },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
        },
      },
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    return pdfDocGenerator;
  };

  const saveInvoice = (invoice) => {
    // Make an API call to save the invoice in the database
    
    return axios
      .post('/api/customers/invoice', invoice)
      .then((response) => {
        console.log('Invoice saved:', response.data);
        return response.data.invoiceNumber;
      })
      .catch((error) => {
        console.log('Error saving invoice:', error);
        return null;
      });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const paymentSuccess = Math.random() < 0.5;
    
    if (paymentSuccess) {
      const invoice = { 
        userId: userDetails._id, 
        userName: userDetails.name,
       
        phone: userDetails.phone,
        products: products.map((product) => ({
          name: product.product.name,
          quantity: product.product.quantity,
          productPrice: product.product.price,
          originalPrice: product.product.originalPrice,
          weight: product.product.weight,
        })),
        totalAmount: paymentAmount,
      };

      saveInvoice(invoice)
        .then((invoiceNumber) => {
          if (invoiceNumber) {
            setInvoiceNumber(invoiceNumber);

            const generatedInvoice = {
              invoiceNumber: invoiceNumber,
              ...invoice,
            };

            const pdfDocGenerator = generateInvoicePDF(generatedInvoice);

            pdfDocGenerator.getBlob((blob) => {
              saveAs(blob, 'invoice.pdf');
            });

            // Clear scanned products from local storage
            localStorage.removeItem('scannedProducts');
          } else {
            console.log('Failed to save invoice.');
          }
        })
        .catch((error) => {
          console.log('Error saving invoice:', error);
        });
    }

    setIsLoading(false);
  };

  return (
    <div className="payment-form-container">
      <Typography variant="h4">Payment Form</Typography>
      <form onSubmit={handlePaymentSubmit}>
        <FormControl fullWidth>
          <InputLabel id="paymentMethod-label">Payment Method</InputLabel>
          <Select
            labelId="paymentMethod-label"
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="upi">UPI</MenuItem>
            <MenuItem value="wallet">Wallet</MenuItem>
          </Select>
        </FormControl>
        {paymentMethod === 'card' && (
          <TextField
            id="cardNumber"
            label="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            fullWidth
          />
        )}
        {paymentMethod === 'card' && (
          <TextField
            id="expirationDate"
            label="Expiration Date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            fullWidth
          />
        )}
        {paymentMethod === 'card' && (
          <TextField
            id="cvv"
            label="CVV"
            value={cvv}
            onChange={(e) => setCVV(e.target.value)}
            fullWidth
          />
        )}
        {paymentMethod === 'upi' && (
          <TextField
            id="UPI"
            label="UPI"
            value={UPI}
            onChange={(e) => setUPI(e.target.value)}
            fullWidth
          />
        )}
        {paymentMethod === 'wallet' && (
          <TextField
            id="Wallet"
            label="Wallet"
            value={Wallet}
            onChange={(e) => setWallet(e.target.value)}
            fullWidth
          />
        )}
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Pay Now'}
        </Button>
      </form>
    </div>
  );
};

export default PaymentForm;
