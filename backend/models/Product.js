const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters long'],
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: [0, 'Quantity cannot be negative'],
    default: 0 
  },
  threshold: { 
    type: Number, 
    required: true, 
    min: [0, 'Threshold cannot be negative'],
    default: 5 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: [2, 'Category must be at least 2 characters long'],
    maxlength: [50, 'Category cannot exceed 50 characters'],
    default: 'General' 
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    enum: ['pieces', 'kg', 'liters', 'boxes', 'units'],
    default: 'pieces'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    default: 'Main Storage'
  },
  supplier: {
    type: String,
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters'],
    default: ''
  },
  barcode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    maxlength: [50, 'Barcode cannot exceed 50 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastRestocked: {
    type: Date,
    default: null
  },
  lastSold: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.quantity <= 0) return 'out-of-stock';
  if (this.quantity <= this.threshold) return 'low-stock';
  return 'in-stock';
});

// Virtual for stock value
productSchema.virtual('stockValue').get(function() {
  return this.quantity * this.price;
});

// Virtual for days since last restock
productSchema.virtual('daysSinceRestock').get(function() {
  if (!this.lastRestocked) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.lastRestocked);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for better performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'quantity': 1, 'threshold': 1 }); // For low stock queries
productSchema.index({ createdAt: -1 });
productSchema.index({ barcode: 1 }, { sparse: true });

// Pre-save middleware to update lastRestocked
productSchema.pre('save', function(next) {
  if (this.isModified('quantity') && this.quantity > this._original?.quantity) {
    this.lastRestocked = new Date();
  }
  next();
});

// Static method to get low stock products
productSchema.statics.getLowStock = function() {
  return this.find({
    $expr: { $lte: ['$quantity', '$threshold'] }
  }).sort({ quantity: 1 });
};

// Static method to get out of stock products
productSchema.statics.getOutOfStock = function() {
  return this.find({ quantity: 0 }).sort({ name: 1 });
};

// Static method to get products by category
productSchema.statics.getByCategory = function(category) {
  return this.find({ category: { $regex: new RegExp(category, 'i') } });
};

// Instance method to check if product needs restocking
productSchema.methods.needsRestocking = function() {
  return this.quantity <= this.threshold;
};

// Instance method to get stock percentage
productSchema.methods.getStockPercentage = function() {
  if (this.threshold === 0) return 100;
  return Math.min(100, (this.quantity / this.threshold) * 100);
};

module.exports = mongoose.model('Product', productSchema); 