const db = require('../models/db');
const nodemailer = require('nodemailer');


// Fetch all orders for admin


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
// Create Nodemailer transporter (you can use Gmail SMTP or any other provider)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'smtp' for other providers
  auth: {
    user: 'turashimyechretien@gmail.com', 
    pass: 'ocqo fveb ppsl xcto', // Replace with your email password
  },
});

// Function to send order confirmation email
const sendOrderConfirmationEmail = (orderDetails, customerEmail) => {
  const { customerPhone, customerAddress, cartItems, totalPrice } = orderDetails;
  
  // Create the email content
  let itemList = '';
  cartItems.forEach(item => {
    itemList += `<li>${item.name} (Quantity: ${item.quantity}) - ${item.price} RWF</li>`;
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: customerEmail,
    subject: 'Your Order Confirmation',
    html: `
      <h2>Thank you for your order!</h2>
      <p>Here are your order details:</p>
      <ul>
        ${itemList}
      </ul>
      <p>Total Price: ${totalPrice} RWF</p>
      <p>Delivery Address: ${customerAddress}</p>
      <p>Phone Number: ${customerPhone}</p>
      <p>We will notify you once your order is ready.</p>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Order confirmation email sent:', info.response);
    }
  });
};

// Place order and send confirmation email
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

        // Send the confirmation email after order is placed
        const orderDetails = { customerPhone, customerAddress, cartItems, totalPrice };
        sendOrderConfirmationEmail(orderDetails, customerEmail);

        res.send('Order placed successfully');
      });
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).send('Error placing order');
  }
};
// Update order status and send email to customer
exports.getAllOrders = async (req, res) => {
  try {
    const sql = `
      SELECT o.*, GROUP_CONCAT(CONCAT(p.name, ' (Qty: ', oi.quantity, ')') SEPARATOR ', ') AS products
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      GROUP BY o.id
      ORDER BY o.order_date DESC
    `;
    db.query(sql, (err, results) => {
      if (err) return res.status(500).send('Error fetching orders.');
      res.json(results);
    });
  } catch (error) {
    res.status(500).send('Error fetching orders.');
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err) => {
    if (err) {
      console.error('Error updating order status:', err); // Log the error
      return res.status(500).send('Error updating order status.');
    }

    // Send email to the customer upon status update
    const orderDetailsSql = `
      SELECT o.customer_email, o.customer_phone, o.customer_address, o.total_price, 
             GROUP_CONCAT(p.name SEPARATOR ', ') AS products
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = ?
      GROUP BY o.id
    `;
    db.query(orderDetailsSql, [id], (err, orderDetails) => {
      if (err || orderDetails.length === 0) {
        console.error('Error fetching order details:', err); // Log the error
        return res.status(500).send('Error fetching order details.');
      }

      const order = orderDetails[0];
      const { customer_email: customerEmail, total_price: totalPrice, products } = order;

      // Email content
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: customerEmail,
        subject: `Your Order Status Has Been Updated: ${status}`,
        html: `
          <h2>Your order status has been updated to: ${status}</h2>
          <p>Order Details:</p>
          <ul>${products}</ul>
          <p>Total Price: ${totalPrice} RWF</p>
          <p>Thank you for shopping with us!</p>
        `,
      };

      // Send email
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending status update email:', err); // Log the error
        } else {
          console.log('Status update email sent:', info.response);
        }
      });

      res.send('Order status updated successfully and customer notified.');
    });
  });
};
