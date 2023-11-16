const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // Password validation pattern: combination of a string, number, or one special character
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/.test(value);
      },
      message: 'Password must contain a combination of a letter, number, or one special character'
    }
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
