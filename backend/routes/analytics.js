const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
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

// Get dashboard analytics
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const [
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalValue,
      categoryStats,
      recentProducts,
      topCategories
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ $expr: { $lte: ['$quantity', '$threshold'] } }),
      Product.countDocuments({ quantity: 0 }),
      Product.aggregate([
        { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
      ]),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Product.find().sort({ createdAt: -1 }).limit(5),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      overview: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        totalValue: totalValue[0]?.total || 0
      },
      categoryStats,
      recentProducts,
      topCategories
    });
  } catch (err) {
    console.error('Error fetching dashboard analytics:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// Get inventory value report
router.get('/inventory-value', verifyToken, async (req, res) => {
  try {
    const { category, sortBy = 'value', order = 'desc' } = req.query;
    
    let matchStage = {};
    if (category) {
      matchStage.category = category;
    }

    const inventoryValue = await Product.aggregate([
      { $match: matchStage },
      {
        $project: {
          name: 1,
          category: 1,
          quantity: 1,
          price: 1,
          value: { $multiply: ['$quantity', '$price'] },
          stockStatus: {
            $cond: {
              if: { $lte: ['$quantity', 0] },
              then: 'out-of-stock',
              else: {
                $cond: {
                  if: { $lte: ['$quantity', '$threshold'] },
                  then: 'low-stock',
                  else: 'in-stock'
                }
              }
            }
          }
        }
      },
      { $sort: { [sortBy]: order === 'desc' ? -1 : 1 } }
    ]);

    const totalValue = inventoryValue.reduce((sum, item) => sum + item.value, 0);

    res.json({
      totalValue,
      items: inventoryValue,
      count: inventoryValue.length
    });
  } catch (err) {
    console.error('Error fetching inventory value:', err);
    res.status(500).json({ error: 'Failed to fetch inventory value' });
  }
});

// Get stock movement analysis
router.get('/stock-movement', verifyToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stockMovement = await Product.aggregate([
      {
        $match: {
          $or: [
            { lastRestocked: { $gte: startDate } },
            { lastSold: { $gte: startDate } }
          ]
        }
      },
      {
        $project: {
          name: 1,
          category: 1,
          quantity: 1,
          lastRestocked: 1,
          lastSold: 1,
          daysSinceRestock: {
            $cond: {
              if: { $ne: ['$lastRestocked', null] },
              then: {
                $ceil: {
                  $divide: [
                    { $subtract: [new Date(), '$lastRestocked'] },
                    1000 * 60 * 60 * 24
                  ]
                }
              },
              else: null
            }
          }
        }
      },
      { $sort: { lastRestocked: -1 } }
    ]);

    res.json({
      period: `${days} days`,
      totalItems: stockMovement.length,
      items: stockMovement
    });
  } catch (err) {
    console.error('Error fetching stock movement:', err);
    res.status(500).json({ error: 'Failed to fetch stock movement' });
  }
});

// Get category performance report
router.get('/category-performance', verifyToken, async (req, res) => {
  try {
    const categoryPerformance = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          avgPrice: { $avg: '$price' },
          lowStockCount: {
            $sum: {
              $cond: [
                { $lte: ['$quantity', '$threshold'] },
                1,
                0
              ]
            }
          },
          outOfStockCount: {
            $sum: {
              $cond: [
                { $eq: ['$quantity', 0] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          totalProducts: 1,
          totalQuantity: 1,
          totalValue: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          lowStockCount: 1,
          outOfStockCount: 1,
          stockHealth: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$totalProducts', '$lowStockCount'] },
                      '$totalProducts'
                    ]
                  },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    res.json({
      categories: categoryPerformance,
      summary: {
        totalCategories: categoryPerformance.length,
        totalProducts: categoryPerformance.reduce((sum, cat) => sum + cat.totalProducts, 0),
        totalValue: categoryPerformance.reduce((sum, cat) => sum + cat.totalValue, 0)
      }
    });
  } catch (err) {
    console.error('Error fetching category performance:', err);
    res.status(500).json({ error: 'Failed to fetch category performance' });
  }
});

// Get supplier analysis
router.get('/supplier-analysis', verifyToken, async (req, res) => {
  try {
    const supplierAnalysis = await Product.aggregate([
      {
        $match: { supplier: { $ne: '', $exists: true } }
      },
      {
        $group: {
          _id: '$supplier',
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          lowStockCount: {
            $sum: {
              $cond: [
                { $lte: ['$quantity', '$threshold'] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          supplier: '$_id',
          totalProducts: 1,
          totalQuantity: 1,
          totalValue: 1,
          lowStockCount: 1,
          avgValuePerProduct: { $round: [{ $divide: ['$totalValue', '$totalProducts'] }, 2] }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    res.json({
      suppliers: supplierAnalysis,
      summary: {
        totalSuppliers: supplierAnalysis.length,
        totalProducts: supplierAnalysis.reduce((sum, sup) => sum + sup.totalProducts, 0),
        totalValue: supplierAnalysis.reduce((sum, sup) => sum + sup.totalValue, 0)
      }
    });
  } catch (err) {
    console.error('Error fetching supplier analysis:', err);
    res.status(500).json({ error: 'Failed to fetch supplier analysis' });
  }
});

// Get export data for reports
router.get('/export', verifyToken, async (req, res) => {
  try {
    const { type = 'all', format = 'json' } = req.query;
    
    let data;
    let filename;
    
    switch (type) {
      case 'inventory':
        data = await Product.find().select('-__v');
        filename = 'inventory-report';
        break;
      case 'low-stock':
        data = await Product.find({ $expr: { $lte: ['$quantity', '$threshold'] } });
        filename = 'low-stock-report';
        break;
      case 'categories':
        data = await Product.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' }
            }
          }
        ]);
        filename = 'category-report';
        break;
      default:
        data = await Product.find().select('-__v');
        filename = 'full-inventory-report';
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csvData);
    }

    res.json({
      type,
      timestamp: new Date().toISOString(),
      count: Array.isArray(data) ? data.length : 1,
      data
    });
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

module.exports = router; 