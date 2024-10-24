const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

// Initialize Express
const app = express();
app.use(cors());

// Increase the payload size limit for body-parser
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for JSON payloads
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Increase limit for URL-encoded data

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Admin@123',  // Replace with your MySQL password
  database: 'agricultural_system'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const inventoryRoutes = require('./routes/ecommerceRoutes');
const OrderRoutes = require('./routes/orderRoutes');

app.use('/auth', authRoutes);  
app.use('/users', userRoutes); 
app.use('/products', productRoutes);  
app.use('/transactions', transactionRoutes);  
app.use('/ecommerce', inventoryRoutes); 
app.use('/orders', OrderRoutes);
app.use('/reports', require('./routes/reportRoutes'))

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
