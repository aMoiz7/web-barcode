const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const { authenticateAdmin } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();



router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    console.log('admin:', admin);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    console.log('Provided password:', password);

    if (password !== admin.password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ isAdmin: admin.isAdmin }, process.env.JWT_SECRET_ADMIN);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({ username, password, isAdmin: true });

    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/dashboard', authenticateAdmin, (req, res) => {
  res.send('Welcome to the dashboard!');
});

module.exports = router;
