const bcrypt = require('bcrypt');
const db = require('../models/db');

// Create a new user (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const sqlCheckUser = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const sqlInsertUser = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';

    // Check if the user already exists
    db.query(sqlCheckUser, [username, email], async (err, results) => {
      if (results.length > 0) {
        return res.status(400).send({ message: 'Username or email already exists' });
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the user into the database with their role
      db.query(sqlInsertUser, [username, email, hashedPassword, role], (err, result) => {
        if (err) {
          return res.status(500).send('Error creating user');
        }
        res.send('User created successfully');
      });
    });
  } catch (error) {
    res.status(500).send('Error creating user');
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const sql = 'SELECT id, username, email, role FROM users';
    db.query(sql, (err, results) => {
      if (err) return res.status(500).send('Error fetching users');
      res.json(results);
    });
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    const sqlUpdateUser = 'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?';

    db.query(sqlUpdateUser, [username, email, role, id], (err, result) => {
      if (err) return res.status(500).send('Error updating user');
      if (result.affectedRows === 0) return res.status(404).send('User not found');
      res.send('User updated successfully');
    });
  } catch (error) {
    res.status(500).send('Error updating user');
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const sqlDeleteUser = 'DELETE FROM users WHERE id = ?';

    db.query(sqlDeleteUser, [id], (err, result) => {
      if (err) return res.status(500).send('Error deleting user');
      if (result.affectedRows === 0) return res.status(404).send('User not found');
      res.send('User deleted successfully');
    });
  } catch (error) {
    res.status(500).send('Error deleting user');
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT id, username, email, role FROM users WHERE id = ?';

    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).send('Error fetching user');
      if (result.length === 0) return res.status(404).send('User not found');
      res.json(result[0]);
    });
  } catch (error) {
    res.status(500).send('Error fetching user');
  }
};
