const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

// Add logging middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Product CRUD routes
router.post('/add', ProductController.addProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.put('/update/:id', ProductController.updateProduct);
router.delete('/delete/:id', ProductController.deleteProduct);

// Sales routes
router.post('/govSale', ProductController.handleGovSale);
router.post('/publicSale', ProductController.handlePublicSale);

// Transaction route
router.get('/transactions', ProductController.getAllTransactions);

module.exports = router;
