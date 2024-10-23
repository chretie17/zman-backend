const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Create a new order
router.post('/order', OrderController.placeOrder);

// Get all orders (Admin)
router.get('/orders', OrderController.getAllOrders);

// Get order by ID
router.get('/orders/:id', OrderController.getOrderById);

// Update order status
router.put('/orders/:id', OrderController.updateOrderStatus);

module.exports = router;
