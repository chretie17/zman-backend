const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Create a new order
router.post('/', OrderController.placeOrder);

// Get all orders (Admin)
router.get('/orders', OrderController.getAllOrders);

// Get order by ID
router.get('/:id', OrderController.getOrderById);

// Update order status
router.put('/:id', OrderController.updateOrderStatus);
router.get('/admin/orders', OrderController.getAllOrders);

// Update order status and send email notification
router.put('/admin/orders/:id/status', OrderController.updateOrderStatus);


module.exports = router;
