const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

router.put('/subsidy', AdminController.adjustSubsidy);
router.get('/report', AdminController.generateSalesReport);

module.exports = router;
