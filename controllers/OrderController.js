const db = require('../models/db');
const nodemailer = require('nodemailer');

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'turashimyechretien@gmail.com',
    pass: 'ocqo fveb ppsl xcto',
  },
});

// Email Template Styles
const emailStyles = `
  body {
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    font-family: 'Arial', sans-serif;
    background-color: #ffffff;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .header {
    background: linear-gradient(135deg, #1E4B38 0%, #2E6E53 100%);
    color: white;
    padding: 40px 20px;
    text-align: center;
  }
  .header h1 {
    margin: 0;
    font-size: 28px;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  }
  .header p {
    margin: 10px 0 0;
    font-size: 16px;
    opacity: 0.9;
  }
  .content {
    padding: 30px;
    background-color: #ffffff;
  }
  .section-title {
    color: #1E4B38;
    font-size: 22px;
    margin: 0 0 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #1E4B38;
  }
  .order-details {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 25px;
    border-radius: 12px;
    margin: 20px 0;
    border: 1px solid #e0e0e0;
  }
  .item-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .item {
    background-color: white;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border-left: 4px solid #1E4B38;
  }
  .item-name {
    color: #1E4B38;
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 5px;
  }
  .item-details {
    color: #666;
    font-size: 14px;
  }
  .total-price {
    background: linear-gradient(135deg, #1E4B38 0%, #2E6E53 100%);
    color: white;
    padding: 20px;
    border-radius: 8px;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-top: 25px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  .delivery-info {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    margin-top: 25px;
    border: 1px solid #e0e0e0;
  }
  .delivery-info h3 {
    color: #1E4B38;
    margin: 0 0 15px;
    font-size: 18px;
  }
  .contact-detail {
    background-color: white;
    padding: 12px 15px;
    border-radius: 6px;
    margin-bottom: 10px;
    border-left: 4px solid #1E4B38;
  }
  .footer {
    background: linear-gradient(135deg, #1E4B38 0%, #2E6E53 100%);
    color: white;
    padding: 30px;
    text-align: center;
  }
  .footer p {
    margin: 5px 0;
    font-size: 14px;
    opacity: 0.9;
  }
  .status-badge {
    display: inline-block;
    padding: 12px 25px;
    border-radius: 25px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 20px 0;
    background: #1E4B38;
    color: white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  .divider {
    height: 2px;
    background: linear-gradient(to right, transparent, #1E4B38, transparent);
    margin: 25px 0;
  }
`;

// Function to send order confirmation email
const sendOrderConfirmationEmail = (orderDetails, customerEmail) => {
  const { customerPhone, customerAddress, cartItems, totalPrice } = orderDetails;
  
  let itemList = cartItems.map(item => 
    `<li class="item">
      <div class="item-name">${item.name}</div>
      <div class="item-details">
        Quantity: ${item.quantity}<br>
        Price per unit: ${item.price.toLocaleString()} RWF
      </div>
    </li>`
  ).join('');

  const mailOptions = {
    from: 'turashimyechretien@gmail.com',
    to: customerEmail,
    subject: '🎉 Thank You for Your Order! - Order Confirmation',
    html: `
      <style>${emailStyles}</style>
      <div class="email-container">
        <div class="header">
          <h1>Thank You for Your Order!</h1>
          <p>We're excited to fulfill your order</p>
        </div>
        
        <div class="content">
          <h2 class="section-title">Order Details</h2>
          
          <div class="order-details">
            <ul class="item-list">
              ${itemList}
            </ul>
            
            <div class="total-price">
              Total Amount: ${totalPrice.toLocaleString()} RWF
            </div>
          </div>

          <div class="divider"></div>

          <div class="delivery-info">
            <h3>📍 Delivery Information</h3>
            <div class="contact-detail">
              <strong>Address:</strong><br>
              ${customerAddress}
            </div>
            <div class="contact-detail">
              <strong>Phone:</strong><br>
              ${customerPhone}
            </div>
          </div>

          <p style="text-align: center; color: #666; margin-top: 25px;">
            We'll process your order soon and keep you updated!
          </p>
        </div>

        <div class="footer">
          <p>Thank you for choosing us!</p>
          <p>© ${new Date().getFullYear()} Ingabo Plant Health</p>
          <p>Questions? Contact our support team</p>
        </div>
      </div>
    `,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        reject(err);
      } else {
        console.log('Order confirmation email sent:', info.response);
        resolve(info);
      }
    });
  });
};

// Update order status email
const sendStatusUpdateEmail = (orderDetails, status) => {
  const { customer_email: customerEmail, total_price: totalPrice, products } = orderDetails;

  const productsList = products.map(product => 
    `<li style="background-color: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 4px solid #1E4B38; list-style: none;">
      <div style="color: #1E4B38; font-weight: bold; font-size: 16px; margin-bottom: 5px;">${product.name}</div>
      <div style="color: #666; font-size: 14px;">
        Quantity: ${product.quantity}<br>
        Price: ${Number(product.price).toLocaleString()} RWF
      </div>
    </li>`
  ).join('');

  const getStatusEmoji = (status) => {
    const emojis = {
      'processing': '⚙️',
      'shipped': '🚚',
      'delivered': '✅',
      'cancelled': '❌'
    };
    return emojis[status.toLowerCase()] || '📦';
  };

  const mailOptions = {
    from: 'turashimyechretien@gmail.com',
    to: customerEmail,
    subject: `${getStatusEmoji(status)} Order Status Update: ${status}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #1E4B38 0%, #2E6E53 100%); color: white; padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">Order Status Update</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your order has been ${status.toLowerCase()}</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="text-align: center;">
            <div style="display: inline-block; padding: 12px 25px; border-radius: 25px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0; background: #1E4B38; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ${getStatusEmoji(status)} ${status.toUpperCase()}
            </div>
          </div>
          
          <h2 style="color: #1E4B38; font-size: 22px; margin: 0 0 20px; padding-bottom: 10px; border-bottom: 2px solid #1E4B38;">Order Details</h2>
          
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin: 20px 0; border: 1px solid #e0e0e0;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${productsList}
            </ul>
            
            <div style="background: linear-gradient(135deg, #1E4B38 0%, #2E6E53 100%); color: white; padding: 20px; border-radius: 8px; font-size: 20px; font-weight: bold; text-align: center; margin-top: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              Total Amount: ${Number(totalPrice).toLocaleString()} RWF
            </div>
          </div>

          <div style="height: 2px; background: linear-gradient(to right, transparent, #1E4B38, transparent); margin: 25px 0;"></div>

          <p style="text-align: center; color: #666; margin-top: 25px;">
            Thank you for your patience. We appreciate your business!
          </p>
        </div>

        <div style="background: linear-gradient(135deg, #1E4B38 0%, #2E6E53 100%); color: white; padding: 30px; text-align: center;">
          <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">Thank you for choosing us!</p>
          <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">© ${new Date().getFullYear()} Ingabo Plant Health</p>
          <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">Questions? Contact our support team</p>
        </div>
      </div>
    `,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending status update email:', err);
        reject(err);
      } else {
        console.log('Status update email sent:', info.response);
        resolve(info);
      }
    });
  });
};
// Helper function to calculate order summary
const calculateOrderSummary = (orders) => {
  return orders.reduce((summary, order) => {
    summary.totalOrders += 1;
    summary.totalRevenue += parseFloat(order.total_price);
    return summary;
  }, { totalOrders: 0, totalRevenue: 0 });
};

// Controller Functions
exports.placeOrder = async (req, res) => {
  const { customerEmail, customerPhone, customerAddress, cartItems } = req.body;

  try {
    let totalPrice = 0;
    cartItems.forEach(item => {
      totalPrice += item.price * item.quantity;
    });

    const orderSql = `INSERT INTO orders (customer_email, customer_phone, customer_address, total_price) VALUES (?, ?, ?, ?)`;
    db.query(orderSql, [customerEmail, customerPhone, customerAddress, totalPrice], (err, result) => {
      if (err) {
        console.error('Error placing order:', err);
        return res.status(500).send('Error placing order');
      }

      const orderId = result.insertId;
      const orderItemsSql = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`;
      const orderItemsData = cartItems.map(item => [orderId, item.id, item.quantity, item.price]);

      db.query(orderItemsSql, [orderItemsData], async (err, result) => {
        if (err) {
          console.error('Error placing order items:', err);
          return res.status(500).send('Error placing order items');
        }

        try {
          const orderDetails = { customerPhone, customerAddress, cartItems, totalPrice };
          await sendOrderConfirmationEmail(orderDetails, customerEmail);
          res.send('Order placed successfully');
        } catch (error) {
          console.error('Error sending confirmation email:', error);
          res.send('Order placed successfully but confirmation email failed');
        }
      });
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).send('Error placing order');
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(sql, [status, id], async (err) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).send('Error updating order status.');
    }

    const orderDetailsSql = `
      SELECT o.customer_email, o.customer_phone, o.customer_address, o.total_price, 
             GROUP_CONCAT(CONCAT(p.name, ':::', oi.quantity, ':::', oi.price) SEPARATOR '|||') AS products
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = ?
      GROUP BY o.id
    `;

    db.query(orderDetailsSql, [id], async (err, orderDetails) => {
      if (err || orderDetails.length === 0) {
        console.error('Error fetching order details:', err);
        return res.status(500).send('Error fetching order details.');
      }

      const order = orderDetails[0];
      
      // Parse products string into array of objects
      order.products = order.products.split('|||').map(product => {
        const [name, quantity, price] = product.split(':::');
        return { name, quantity, price };
      });

      try {
        await sendStatusUpdateEmail(order, status);
        res.send('Order status updated successfully and customer notified.');
      } catch (error) {
        console.error('Error sending status update email:', error);
        res.status(500).send('Error sending status update email.');
      }
    });
  });
};

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
        if (err) {
          console.error('Error fetching orders:', err);
          return res.status(500).send('Error fetching orders.');
        }
        res.json(results);
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send('Error fetching orders.');
    }
  };
  
  
  
  exports.getOrderStats = async (req, res) => {
    try {
      const sql = `
        SELECT o.*, 
               GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') as products
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY o.id
      `;
  
      db.query(sql, (err, results) => {
        if (err) {
          console.error('Error fetching order statistics:', err);
          return res.status(500).send('Error fetching order statistics.');
        }
  
        const summary = calculateOrderSummary(results);
        
        const stats = {
          last30Days: {
            totalOrders: summary.totalOrders,
            totalRevenue: summary.totalRevenue,
            averageOrderValue: summary.totalOrders > 0 
              ? summary.totalRevenue / summary.totalOrders 
              : 0
          },
          recentOrders: results.slice(0, 5) // Last 5 orders
        };
  
        res.json(stats);
      });
    } catch (error) {
      console.error('Error calculating order statistics:', error);
      res.status(500).send('Error calculating order statistics.');
    }
  };
  
  exports.getCustomerOrders = async (req, res) => {
    const { email } = req.params;
  
    try {
      const sql = `
        SELECT o.*,
               GROUP_CONCAT(
                 CONCAT(
                   p.name, ' (Qty: ', oi.quantity, 
                   ', Price: ', oi.price, ')'
                 ) SEPARATOR '; '
               ) as order_items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.customer_email = ?
        GROUP BY o.id
        ORDER BY o.order_date DESC
      `;
  
      db.query(sql, [email], (err, results) => {
        if (err) {
          console.error('Error fetching customer orders:', err);
          return res.status(500).send('Error fetching customer orders.');
        }
  
        const formattedOrders = results.map(order => ({
          ...order,
          order_date: new Date(order.order_date).toLocaleString(),
          order_items: order.order_items.split('; ').map(item => {
            const matches = item.match(/(.+) \(Qty: (\d+), Price: (\d+(?:\.\d+)?)\)/);
            if (matches) {
              return {
                name: matches[1],
                quantity: parseInt(matches[2]),
                price: parseFloat(matches[3])
              };
            }
            return null;
          }).filter(Boolean)
        }));
  
        res.json(formattedOrders);
      });
    } catch (error) {
      console.error('Error fetching customer order history:', error);
      res.status(500).send('Error fetching customer order history.');
    }
  };
  
  exports.cancelOrder = async (req, res) => {
    const { id } = req.params;
    const { cancellationReason } = req.body;
  
    try {
      const checkOrderSql = 'SELECT status, customer_email FROM orders WHERE id = ?';
      
      db.query(checkOrderSql, [id], async (err, results) => {
        if (err) {
          console.error('Error checking order status:', err);
          return res.status(500).send('Error checking order status.');
        }
  
        if (results.length === 0) {
          return res.status(404).send('Order not found.');
        }
  
        const order = results[0];
        
        if (order.status === 'delivered') {
          return res.status(400).send('Cannot cancel a delivered order.');
        }
  
        const updateSql = `
          UPDATE orders 
          SET status = 'cancelled', 
              cancellation_reason = ?,
              updated_at = NOW()
          WHERE id = ?
        `;
  
        db.query(updateSql, [cancellationReason, id], async (err) => {
          if (err) {
            console.error('Error cancelling order:', err);
            return res.status(500).send('Error cancelling order.');
          }
  
          const orderDetailsSql = `
            SELECT o.*, 
                   GROUP_CONCAT(CONCAT(p.name, ':::', oi.quantity, ':::', oi.price) SEPARATOR '|||') AS products
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.id = ?
            GROUP BY o.id
          `;
  
          db.query(orderDetailsSql, [id], async (err, orderDetails) => {
            if (!err && orderDetails.length > 0) {
              try {
                const parsedOrder = {
                  ...orderDetails[0],
                  products: orderDetails[0].products.split('|||').map(product => {
                    const [name, quantity, price] = product.split(':::');
                    return { name, quantity, price };
                  })
                };
                await sendStatusUpdateEmail(parsedOrder, 'cancelled');
              } catch (emailError) {
                console.error('Error sending cancellation email:', emailError);
              }
            }
  
            res.send('Order cancelled successfully.');
          });
        });
      });
    } catch (error) {
      console.error('Error in cancel order process:', error);
      res.status(500).send('Error processing order cancellation.');
    }
  };
  exports.getOrderById = async (req, res) => {
    const { id } = req.params;
    const sql = `
      SELECT o.*, p.name AS product_name, oi.quantity, oi.price
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = ?
    `;
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('Error fetching order details:', err);
        return res.status(500).send('Error fetching order.');
      }
      res.json(results);
    });
  };
  module.exports = {
    getOrderById: exports.getOrderById,
    getAllOrders: exports.getAllOrders,
    placeOrder: exports.placeOrder,
    updateOrderStatus: exports.updateOrderStatus,
    getOrderStats: exports.getOrderStats,
    getCustomerOrders: exports.getCustomerOrders,
    cancelOrder: exports.cancelOrder
  };
  