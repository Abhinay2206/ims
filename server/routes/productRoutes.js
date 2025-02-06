const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Route to add a new product
router.post('/add', async (req, res) => {
  try {
    const { name, sku, stock, lowStockThreshold, price, category, manufacturing_date, expiry_date } = req.body;
    
    // Create new product
    const newProduct = new Product({
      name,
      sku,
      stock,
      lowStockThreshold,
      price,
      category,
      manufacturing_date,
      expiry_date
    });

    // Save the product to the database
    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().select('name sku stock lowStockThreshold price category manufacturing_date expiry_date');
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Route to update a product based on SKU
router.put('/update/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const { name, stock, lowStockThreshold, price, category, manufacturing_date, expiry_date } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { sku },
      { name, stock, lowStockThreshold, price, category, manufacturing_date, expiry_date },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found with the given SKU' });
    }

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to delete a product based on SKU
router.delete('/delete/:sku', async (req, res) => {
  try {
    const { sku } = req.params;

    const deletedProduct = await Product.findOneAndDelete({ sku });

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found with the given SKU' });
    }

    res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
