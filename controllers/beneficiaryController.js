const db = require('../models/db');

// Fetch all beneficiaries
exports.getAllBeneficiaries = async (req, res) => {
  try {
    const sql = 'SELECT * FROM approved_beneficiaries';
    db.query(sql, (err, results) => {
      if (err) {
        return res.status(500).send('Error fetching beneficiaries');
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).send('Error fetching beneficiaries');
  }
};

// Add a new beneficiary
exports.addBeneficiary = async (req, res) => {
  const { name, national_id, phone_number, needs } = req.body;
  try {
    const sql = 'INSERT INTO approved_beneficiaries (name, national_id, phone_number,needs) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, national_id, phone_number,needs], (err, result) => {
      if (err) {
        console.error('Error adding beneficiary:', err);
        return res.status(500).send('Error adding beneficiary');
      }
      res.send('Beneficiary added successfully');
    });
  } catch (error) {
    res.status(500).send('Error adding beneficiary');
  }
};

// Update an existing beneficiary
exports.updateBeneficiary = async (req, res) => {
  const { id } = req.params;
  const { name, national_id, phone_number, needs } = req.body;
  try {
    const sql = 'UPDATE approved_beneficiaries SET name = ?, national_id = ?, phone_number = ?, needs = ? WHERE id = ?';
    db.query(sql, [name, national_id, phone_number, needs, id], (err, result) => {
      if (err) {
        console.error('Error updating beneficiary:', err);
        return res.status(500).send('Error updating beneficiary');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Beneficiary not found');
      }
      res.send('Beneficiary updated successfully');
    });
  } catch (error) {
    res.status(500).send('Error updating beneficiary');
  }
};

// Delete a beneficiary
exports.deleteBeneficiary = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = 'DELETE FROM approved_beneficiaries WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        return res.status(500).send('Error deleting beneficiary');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Beneficiary not found');
      }
      res.send('Beneficiary deleted successfully');
    });
  } catch (error) {
    res.status(500).send('Error deleting beneficiary');
  }
};

// Activate a beneficiary
exports.activateBeneficiary = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = 'UPDATE approved_beneficiaries SET is_active = 1 WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Error activating beneficiary:', err);
        return res.status(500).send('Error activating beneficiary');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Beneficiary not found');
      }
      res.send('Beneficiary activated successfully');
    });
  } catch (error) {
    res.status(500).send('Error activating beneficiary');
  }
};

// Deactivate a beneficiary
exports.deactivateBeneficiary = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = 'UPDATE approved_beneficiaries SET is_active = 0 WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Error deactivating beneficiary:', err);
        return res.status(500).send('Error deactivating beneficiary');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Beneficiary not found');
      }
      res.send('Beneficiary deactivated successfully');
    });
  } catch (error) {
    res.status(500).send('Error deactivating beneficiary');
  }
};
exports.getActiveBeneficiaries = async (req, res) => {
    try {
      const sql = 'SELECT * FROM approved_beneficiaries WHERE is_active = 1';
      db.query(sql, (err, results) => {
        if (err) {
          console.error('Error fetching active beneficiaries:', err);
          return res.status(500).send('Error fetching active beneficiaries');
        }
        res.json(results);
      });
    } catch (error) {
      console.error('Unexpected error fetching active beneficiaries:', error);
      res.status(500).send('Error fetching active beneficiaries');
    }
  };