const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController');

// Existing routes
router.post('/govSale', TransactionController.govSale);
router.post('/publicSale', TransactionController.publicSale);
router.get('/sales/history', TransactionController.getSalesTransactions);

// Fetch all transactions for admin
router.get('/admin/history', TransactionController.getAllTransactions);

// New CRUD routes for transactions

// Add a new transaction (if necessary)
router.post('/', TransactionController.addTransaction);

// Update an existing transaction by ID
router.put('/:id', TransactionController.updateTransaction);

// Delete a transaction by ID
router.delete('/:id', TransactionController.deleteTransaction);

module.exports = router;
