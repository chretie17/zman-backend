const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

router.get('/dashboard', AdminController.getDashboardData);


module.exports = router;
