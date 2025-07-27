const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  threshold: {
    type: Number,
    required: true,
    min: 0,
    default: 5, // default low stock threshold
  },
  category: {
    type: String,
    required: true,
    trim: true,
    default: 'General',
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema); 