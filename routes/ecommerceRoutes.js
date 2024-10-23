const express = require('express');
const router = express.Router();
const ECommerceController = require('../controllers/EcommerceController');

// Fetch products for eCommerce
router.get('/products', ECommerceController.getProducts);

// Place an order
router.post('/orders', ECommerceController.placeOrder);

module.exports = router;
