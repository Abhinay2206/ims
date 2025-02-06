const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  lowStockThreshold: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  manufacturing_date: {
    type: Date,
    required: true,
  },
  expire_date: {
    type: Date,
    required: true,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
