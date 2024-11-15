const express = require('express');
const beneficiaryController = require('../controllers/beneficiaryController');

const router = express.Router();

// GET: Fetch all beneficiaries
router.get('/', beneficiaryController.getAllBeneficiaries);

// POST: Add a new beneficiary
router.post('/add', beneficiaryController.addBeneficiary);

// PUT: Update an existing beneficiary
router.put('/update/:id', beneficiaryController.updateBeneficiary);

// DELETE: Delete a beneficiary
router.delete('/delete/:id', beneficiaryController.deleteBeneficiary);

// PUT: Activate a beneficiary
router.put('/activate/:id', beneficiaryController.activateBeneficiary);

// PUT: Deactivate a beneficiary
router.put('/deactivate/:id', beneficiaryController.deactivateBeneficiary);
router.get('/active', beneficiaryController.getActiveBeneficiaries);
  
module.exports = router;
