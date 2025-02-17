const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Create a new order
router.post('/', OrderController.placeOrder);

// Get all orders (Admin)
router.get('/orders', OrderController.getAllOrders);

router.get('/:id', OrderController.getOrderById);

router.put('/:id', OrderController.updateOrderStatus);
router.get('/admin/orders', OrderController.getAllOrders);

router.put('/admin/orders/:id/status', OrderController.updateOrderStatus);


module.exports = router;
