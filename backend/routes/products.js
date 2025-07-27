const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all products with pagination, sorting, and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'desc',
      search = '',
      category = '',
      lowStock = false
    } = req.query;

    // Build query
    let query = {};
    
    // Search functionality
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Low stock filter
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$threshold'] };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query
    const products = await Product.find(query)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', 10] } }, // Assuming $10 per unit
          avgQuantity: { $avg: '$quantity' },
          minQuantity: { $min: '$quantity' },
          maxQuantity: { $max: '$quantity' }
        }
      }
    ]);

    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$threshold'] }
    });

    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overall: stats[0] || {
        totalProducts: 0,
        totalQuantity: 0,
        totalValue: 0,
        avgQuantity: 0,
        minQuantity: 0,
        maxQuantity: 0
      },
      lowStockCount,
      categoryStats
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get products below threshold (low stock)
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$threshold'] }
    }).sort({ quantity: 1 });

    res.json({
      count: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (err) {
    console.error('Error fetching low stock products:', err);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Add a new product (protected route)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, quantity, threshold, category } = req.body;
    
    // Validation
    if (!name || quantity === undefined || threshold === undefined || !category) {
      return res.status(400).json({ 
        error: 'Name, quantity, threshold, and category are required.' 
      });
    }

    if (quantity < 0 || threshold < 0) {
      return res.status(400).json({ 
        error: 'Quantity and threshold must be non-negative numbers.' 
      });
    }

    // Check for duplicate product name
    const existingProduct = await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingProduct) {
      return res.status(400).json({ 
        error: 'A product with this name already exists.' 
      });
    }

    const product = new Product({ 
      name, 
      quantity: Number(quantity), 
      threshold: Number(threshold), 
      category,
      createdBy: req.user.id
    });
    
    await product.save();
    
    res.status(201).json({
      message: 'Product added successfully',
      product
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(400).json({ error: err.message });
  }
});

// Bulk add products (protected route)
router.post('/bulk', verifyToken, async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    const results = [];
    const errors = [];

    for (const productData of products) {
      try {
        const { name, quantity, threshold, category } = productData;
        
        if (!name || quantity === undefined || threshold === undefined || !category) {
          errors.push({ name: name || 'Unknown', error: 'Missing required fields' });
          continue;
        }

        const existingProduct = await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingProduct) {
          errors.push({ name, error: 'Product already exists' });
          continue;
        }

        const product = new Product({ 
          name, 
          quantity: Number(quantity), 
          threshold: Number(threshold), 
          category,
          createdBy: req.user.id
        });
        
        await product.save();
        results.push(product);
      } catch (error) {
        errors.push({ name: productData.name || 'Unknown', error: error.message });
      }
    }

    res.status(201).json({
      message: `Successfully added ${results.length} products`,
      added: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (err) {
    console.error('Error bulk adding products:', err);
    res.status(500).json({ error: 'Failed to add products' });
  }
});

// Update product (protected route)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { quantity, threshold, name, category } = req.body;
    const update = {};
    
    if (quantity !== undefined) {
      if (quantity < 0) {
        return res.status(400).json({ error: 'Quantity must be non-negative' });
      }
      update.quantity = quantity;
    }
    
    if (threshold !== undefined) {
      if (threshold < 0) {
        return res.status(400).json({ error: 'Threshold must be non-negative' });
      }
      update.threshold = threshold;
    }
    
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }
      
      // Check for duplicate name (excluding current product)
      const existingProduct = await Product.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingProduct) {
        return res.status(400).json({ error: 'A product with this name already exists' });
      }
      
      update.name = name;
    }
    
    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({ error: 'Category cannot be empty' });
      }
      update.category = category;
    }

    update.updatedBy = req.user.id;
    update.updatedAt = new Date();

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      update, 
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete a product (protected route)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({
      message: 'Product deleted successfully',
      deletedProduct: product
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Bulk delete products (protected route)
router.delete('/bulk', verifyToken, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Product IDs array is required' });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });
    
    res.json({
      message: `Successfully deleted ${result.deletedCount} products`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error bulk deleting products:', err);
    res.status(500).json({ error: 'Failed to delete products' });
  }
});

module.exports = router; 