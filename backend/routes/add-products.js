const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {authenticateAdmin ,authenticate} = require('../middleware/auth');
const Product = require('../models/products');
const Cache = require('../models/Cache');





//


//


router.post('/addProduct', authenticateAdmin, (req, res) => {
  const product = new Product({
    name: req.body.name,
    productCode: req.body.productCode,
    price: req.body.price,
    category: req.body.category, // Add the category field
  });

  product
    .save()
    .then(() => {
      console.log('Product saved');
      res.send(product);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error saving product');
    });
});

//


router.get('/', (req, res) => {
  Product.find()
    .then(products => {
      res.send(products);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error fetching products');
    });
});
// Route to handle retrieving product details and updating the user's cart




// ...


// Your other route handlers and middleware...


router.get('/:barcode', authenticate, async (req, res) => {
  const barcode = req.params.barcode;
  const userId = req.user._id;
  console.log(userId);

  const isCode128 = /^9700(\d{4})(\d{4})(\d{4})$/.test(barcode);
  const isEAN13India = /^(\d{8})(\d{4})(\d{1})$/.test(barcode);

  if (isCode128) {
    const match = barcode.match(/^9700(\d{4})(\d{4})(\d{4})$/);
    const productCode = match[1];

    console.log('Product code:', productCode);
    try {
      const cacheKey = `product:${productCode},userid:${userId}`;
      let cacheData = await Cache.findOne({ key: cacheKey });

      if (cacheData) {
        const { name, weight, price, cartData } = JSON.parse(cacheData.value);
        const cart = JSON.parse(cartData);

        const item = cart.items.find((item) => item.productCode === productCode);

        if (item) {
          item.quantity += 1;
          item.price += price;
        } else {
          cart.items.push({
            productCode: productCode,
            quantity: 1,
            price: price,
          });
        }

        await Cache.updateOne(
          { key: cacheKey },
          { value: JSON.stringify({ name, weight, price, cartData: JSON.stringify(cart) }) }
        );

        const response = {
          name,
          weight,
          originalPrice: price.toFixed(2),
          price: item.price,
          quantity: item.quantity,
          productCode: productCode,
          cart,
        };

        res.json(response);
      } else {
        console.log('Before findOne query');

        // Fetch product details from the database
        const product = await Product.findOne({ productCode });
        console.log('Product code:', productCode);
        console.log('Product:', product);
        if (!product) {
          return res.status(404).send('Product not found');
        }

        const weight = parseFloat(match[2]) / 1000;
        const price = parseFloat(match[3]) / 10.0;

        const cart = {
          userId: userId,
          items: [
            {
              productCode: productCode,
              quantity: 1,
              price: price,
            },
          ],
        };

        await Cache.create({
          key: cacheKey,
          value: JSON.stringify({ name: product.name, weight: weight.toFixed(3), price, cartData: JSON.stringify(cart) }),
        });

        const response = {
          name: product.name,
          weight: weight.toFixed(3),
          originalPrice: price.toFixed(2),
          price: price,
          quantity: 1,
          productCode: productCode,
          cart,
        };

        res.json(response);
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal server error');
    }
  } else if (isEAN13India) {
    const regex = /^(\d{8})(\d{4})(\d{1})$/;
    const match = regex.exec(barcode) || [];
    if (!match) {
      return res.status(400).send('Invalid barcode format');
    }

    const productCode = match[2];

    console.log('Product code:', productCode);
    try {
      const cacheKey = `product:${productCode},userid:${userId}`;
      let cacheData = await Cache.findOne({ key: cacheKey });

      if (cacheData) {
        const { name, price, cartData } = JSON.parse(cacheData.value);
        const cart = JSON.parse(cartData);

        const item = cart.items.find((item) => item.productCode === productCode);

        if (item) {
          item.quantity += 1;
          item.price = (item.quantity * price).toFixed(2);
        } else {
          cart.items.push({
            productCode: productCode,
            quantity: 1,
            price: price.toFixed(2),
          });
        }

        await Cache.updateOne(
          { key: cacheKey },
          { value: JSON.stringify({ name, price, cartData: JSON.stringify(cart) }) }
        );

        const response = {
          name,
          price: item.price,
          originalPrice: price.toFixed(2),
          quantity: item.quantity,
          productCode: productCode,
          cart,
        };

        res.json(response);
      } else {
        console.log('Before findOne query');

        // Fetch product details from the database
        const product = await Product.findOne({ productCode });
        console.log('Product code:', productCode);
        console.log('Product:', product);
        if (!product) {
          return res.status(404).send('Product not found');
        }

        const price = product.price;

        const cart = {
          userId: userId,
          items: [
            {
              productCode: productCode,
              quantity: 1,
              price: product.price,
            },
          ],
        };

        await Cache.create({
          key: cacheKey,
          value: JSON.stringify({ name: product.name, price, cartData: JSON.stringify(cart) }),
        });

        const response = {
          name: product.name,
          price: price.toFixed(2),
          originalPrice: price.toFixed(2),
          quantity: 1,
          productCode: productCode,
          cart,
        };

        res.json(response);
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal server error');
    }
  } else {
    res.status(400).send('Invalid barcode format');
  }
});






  
router.patch('/cart/items/:productCode', authenticate, async (req, res) => {
  const productCode = req.params.productCode;
  const userId = req.user._id;

  try {
    const cacheKey = `product:${productCode},userid:${userId}`;
    const cachedData = await Cache.findOne({ key: cacheKey });

    if (!cachedData) {
      return res.status(404).send('Cart not found');
    }

    const { name, price, cartData } = JSON.parse(cachedData.value);
    const cart = JSON.parse(cartData);

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(404).send('No items found in cart');
    }

    const productIndex = cart.items.findIndex(item => item.productCode === productCode);

    if (productIndex === -1) {
      return res.status(404).send('Product not found in cart');
    }

    const product = cart.items[productIndex];

    if (product.quantity <= 1) {
      // Remove the product from the cart
      cart.items.splice(productIndex, 1);
    } else {
      product.quantity -= 1;
      product.price -= price;
    }

    if (cart.items.length === 0) {
      // Delete the cart if it becomes empty
      await Cache.findOneAndDelete({ key: cacheKey });
      return res.send({
        message: 'Product removed from cart. Cart is empty.',
        cart: null
      });
    } else {
      await Cache.updateOne(
        { key: cacheKey },
        { value: JSON.stringify({ name, price, cartData: JSON.stringify(cart) }) }
      );

      // Fetch the updated cache after the update
      const updatedCache = await Cache.findOne({ key: cacheKey });

      res.send({
        message: 'Product updated in cart',
        cart: JSON.parse(updatedCache.value).cartData
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;




  


  