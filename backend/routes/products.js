const express = require('express');
const router = express.Router();

// Minimal GET route for testing
router.get('/', (req, res) => {
  res.json([]);
});

module.exports = router; 