import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductList = () => {
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    axios.get('/api/product/')
      .then(response => {
        const products = response.data;
        // Extract unique categories from products
        const uniqueCategories = [...new Set(products.map(product => product.category))];
        setCategories(uniqueCategories);
        setFilteredProducts(products);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const handleCategoryFilterChange = (event) => {
    const selectedCategory = event.target.value;
    setCategoryFilter(selectedCategory);

    if (selectedCategory) {
      axios.get(`/api/product/?category=${selectedCategory}`)
        .then(response => {
          setFilteredProducts(response.data);
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      setFilteredProducts([]);
    }
  };

  return (
    <div>
      <h2>Product List</h2>
      <div>
        <label>Filter by Category:</label>
        <select value={categoryFilter} onChange={handleCategoryFilterChange}>
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <ul>
        {filteredProducts.map(product => (
          <li key={product._id}>
            <div>
              <strong>Name: </strong>{product.name}
            </div>
            <div>
              <strong>Product Code: </strong>{product.productCode}
            </div>
            <div>
              <strong>Price: </strong>{product.price}
            </div>
            <div>
              <strong>Category: </strong>{product.category}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
