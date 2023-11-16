const jwt = require('jsonwebtoken');
require('dotenv').config();


function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET_ADMIN);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.admin = decoded;           
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = verifyAdmin;
