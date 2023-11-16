import React from 'react';
import "./App.css";
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/dashboard';
import AdminLogin from '../pages/adminLogin';
import Addproduct from '../pages/addProduct'
import Products from '../pages/products'
import SideBar from '../pages/sidebar';

const Admin = () => {
  return (
    <div>
      
      <div className="admin-content">
        <Routes>
        <Route path="/" element={<AdminLogin/>} />
        
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/addproduct" element={<Addproduct />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
