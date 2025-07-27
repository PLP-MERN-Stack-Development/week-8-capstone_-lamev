const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Minimal GET route for testing
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new product
router.post('/', async (req, res) => {
  try {
    const { name, quantity, threshold, category } = req.body;
    if (!name || quantity === undefined || threshold === undefined || !category) {
      return res.status(400).json({ error: 'Name, quantity, threshold, and category are required.' });
    }
    const product = new Product({ name, quantity, threshold, category });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { quantity, threshold, name, category } = req.body;
    const update = {};
    if (quantity !== undefined) update.quantity = quantity;
    if (threshold !== undefined) update.threshold = threshold;
    if (name !== undefined) update.name = name;
    if (category !== undefined) update.category = category;
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 