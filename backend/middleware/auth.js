const jwt = require('jsonwebtoken');
require('dotenv').config();



//
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies.jwt;

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log(decoded);
    req.user = { _id: decoded.id }; // Set req.user as the decoded user ID
    next();
  } catch (error) {
    console.error(error);
    res.status(401).send('Invalid token');
  }
}




  //

  
//
// Middleware to authenticate admin
async function authenticateAdmin(req, res, next) {
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
  
  
  
  module.exports = {
    authenticate,
    authenticateAdmin
  };

  



