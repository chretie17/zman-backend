const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

const JWT_SECRET = 'ee71d923192e675258886fe282c6265b4f9462f27b18b958afba3f2f0686a8c1d99279e9a82b434a410a92a4dc8bad419628274985815df95f4cc73da1badf18'; // Replace this with the generated key

// User Sign-Up (as before)
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const sqlCheckUser = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const sqlInsertUser = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';

    db.query(sqlCheckUser, [username, email], async (err, results) => {
      if (results.length > 0) {
        return res.status(400).send({ message: 'Username or email already exists' });
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the user into the database with their role
      db.query(sqlInsertUser, [username, email, hashedPassword, role], (err, result) => {
        if (err) {
          return res.status(500).send('Error registering user');
        }
        res.send('User registered successfully');
      });
    });
  } catch (error) {
    res.status(500).send('Error registering user');
  }
};

// User Login with JWT generation
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const sqlGetUser = 'SELECT * FROM users WHERE username = ? OR email = ?';

    // Find user by username or email
    db.query(sqlGetUser, [identifier, identifier], async (err, results) => {
      if (err) throw err;
      if (results.length === 0) return res.status(401).send({ message: 'Invalid credentials' });

      const user = results[0];

      // Compare password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(401).send({ message: 'Invalid credentials' });

      // Generate JWT using the secret key
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);

      // Return the token, user ID, and role
      res.send({ token, userId: user.id, role: user.role });
    });
  } catch (error) {
    res.status(500).send('Error logging in');
  }
};
