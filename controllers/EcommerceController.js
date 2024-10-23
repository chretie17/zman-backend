const db = require('../models/db');

// Fetch all products (for eCommerce page)
exports.getProducts = async (req, res) => {
  try {
    const sql = 'SELECT * FROM products WHERE stock > 0';
    db.query(sql, (err, results) => {
      if (err) return res.status(500).send('Error fetching products');
      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
};

// Place an order
exports.placeOrder = async (req, res) => {
  const { email, phone_number, address, items, payment_method } = req.body;

  try {
    // Calculate total price
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Insert new order
    const orderSql = `INSERT INTO orders (email, phone_number, address, total_price, payment_method, status) VALUES (?, ?, ?, ?, ?, 'pending')`;
    db.query(orderSql, [email, phone_number, address, totalPrice, payment_method], (err, result) => {
      if (err) return res.status(500).send('Error placing order');

      const orderId = result.insertId;

      // Insert each item in the order
      const orderItemsSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
      const orderItemsData = items.map((item) => [orderId, item.productId, item.quantity, item.price]);

      db.query(orderItemsSql, [orderItemsData], (err) => {
        if (err) return res.status(500).send('Error saving order items');
        res.send('Order placed successfully');
      });
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).send('Error placing order');
  }
};
