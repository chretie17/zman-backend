const express = require('express');
const reportController = require('../controllers/ReportController');

const router = express.Router();

// Route to generate and fetch the report
router.get('/generate', reportController.generateReport);
router.get('/generateGovernment', reportController.generateGovernmentReport);

module.exports = router;
