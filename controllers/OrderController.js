const db = require('../models/db');

// Create a new order
exports.createOrder = async (req, res) => {
  const { customerEmail, customerPhone, customerAddress, cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).send('No items in cart.');
  }

  // Calculate the total price
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Create the order
  const orderSql = 'INSERT INTO orders (customer_email, customer_phone, customer_address, total_price) VALUES (?, ?, ?, ?)';
  db.query(orderSql, [customerEmail, customerPhone, customerAddress, totalPrice], (err, orderResult) => {
    if (err) return res.status(500).send('Error creating order.');

    const orderId = orderResult.insertId;

    // Insert cart items for this order
    const cartItemsSql = 'INSERT INTO cart_items (order_id, product_id, quantity, price) VALUES ?';
    const cartItemsData = cartItems.map((item) => [orderId, item.productId, item.quantity, item.price]);

    db.query(cartItemsSql, [cartItemsData], (err) => {
      if (err) return res.status(500).send('Error saving cart items.');

      res.status(201).send('Order placed successfully.');
    });
  });
};

// Fetch all orders for admin
exports.getAllOrders = async (req, res) => {
  try {
    const sql = `
      SELECT o.*, GROUP_CONCAT(p.name SEPARATOR ', ') AS products
      FROM orders o
      JOIN cart_items ci ON o.id = ci.order_id
      JOIN products p ON ci.product_id = p.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    db.query(sql, (err, results) => {
      if (err) return res.status(500).send('Error fetching orders.');
      res.json(results);
    });
  } catch (error) {
    res.status(500).send('Error fetching orders.');
  }
};

// Fetch single order by ID
exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT o.*, p.name AS product_name, ci.quantity, ci.price
    FROM orders o
    JOIN cart_items ci ON o.id = ci.order_id
    JOIN products p ON ci.product_id = p.id
    WHERE o.id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).send('Error fetching order.');
    res.json(results);
  });
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).send('Error updating order status.');
    res.send('Order status updated successfully.');
  });
};
exports.placeOrder = async (req, res) => {
    const { customerEmail, customerPhone, customerAddress, cartItems } = req.body;
  
    try {
      let totalPrice = 0;
      cartItems.forEach(item => {
        totalPrice += item.price * item.quantity;
      });
  
      // Insert into orders table
      const orderSql = `INSERT INTO orders (customer_email, customer_phone, customer_address, total_price) VALUES (?, ?, ?, ?)`;
      db.query(orderSql, [customerEmail, customerPhone, customerAddress, totalPrice], (err, result) => {
        if (err) {
          return res.status(500).send('Error placing order');
        }
  
        const orderId = result.insertId;
  
        // Insert into order_items table
        const orderItemsSql = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`;
        const orderItemsData = cartItems.map(item => [orderId, item.id, item.quantity, item.price]);
  
        db.query(orderItemsSql, [orderItemsData], (err, result) => {
          if (err) {
            return res.status(500).send('Error placing order items');
          }
          res.send('Order placed successfully');
        });
      });
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).send('Error placing order');
    }
  };