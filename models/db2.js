const mysql = require('mysql2/promise');

// Create MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Admin@123', // Replace with your actual password
  database: 'agricultural_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
