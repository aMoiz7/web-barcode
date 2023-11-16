import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleProductCodeChange = (event) => {
    setProductCode(event.target.value);
  };

  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  
    const handleSubmit = (event) => {
        event.preventDefault();
      
        const productData = {
          name: name,
          productCode: productCode,
          price: price,
          category: category,
        };
      
        const token = localStorage.getItem('token');
      
        fetch('/api/product/addProduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        })
          .then(response => {
            if (response.ok) {
              console.log('Product added successfully');
              // Reset the form fields
              setName('');
              setProductCode('');
              setPrice('');
              setCategory('');
            } else {
              throw new Error('Error adding product');
            }
          })
          .catch(error => {
            console.error(error);
          });
      };

  return (
    <div>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={handleNameChange} />
        </div>
        <div>
          <label>Product Code:</label>
          <input type="text" value={productCode} onChange={handleProductCodeChange} />
        </div>
        <div>
          <label>Price:</label>
          <input type="number" value={price} onChange={handlePriceChange} />
        </div>
        <div>
          <label>Category:</label>
          <input type="text" value={category} onChange={handleCategoryChange} />
        </div>
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
