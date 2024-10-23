const db = require('../models/db');

// Process Government-Subsidized Sale
exports.govSale = async (req, res) => {
  const { productId, quantity, buyerName, phoneNumber, govId } = req.body;

  try {
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [productId], (err, products) => {
      if (err || products.length === 0) {
        return res.status(404).send('Product not found');
      }

      const product = products[0];
      if (product.stock < quantity) {
        return res.status(400).send('Not enough stock');
      }

      const subsidyAmount = (product.price * product.subsidy_percentage) / 100;
      const finalPrice = (product.price - subsidyAmount) * quantity;

      // Insert transaction for government sale
      const transactionSql = `INSERT INTO transactions 
                              (product_id, buyer_name, phone_number, government_id, transaction_type, price, subsidy_applied, final_price, payment_method, transaction_date) 
                              VALUES (?, ?, ?, ?, 'subsidized', ?, ?, ?, 'field sale', NOW())`;
      db.query(
        transactionSql,
        [productId, buyerName, phoneNumber, govId, product.price, subsidyAmount, finalPrice],
        (err, result) => {
          if (err) return res.status(500).send('Error processing transaction');

          // Update stock after the transaction
          const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
          db.query(updateStockSql, [quantity, productId]);

          res.send('Government-Subsidized Sale completed successfully');
        }
      );
    });
  } catch (error) {
    console.error('Error processing government sale:', error);
    res.status(500).send('Error processing sale');
  }
};

// Process Public Sale
exports.publicSale = async (req, res) => {
  const { productId, quantity, buyerName, phoneNumber } = req.body;

  try {
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [productId], (err, products) => {
      if (err || products.length === 0) {
        return res.status(404).send('Product not found');
      }

      const product = products[0];
      if (product.stock < quantity) {
        return res.status(400).send('Not enough stock');
      }

      const finalPrice = product.price * quantity;

      // Insert transaction for public sale
      const transactionSql = `INSERT INTO transactions 
                              (product_id, buyer_name, phone_number, transaction_type, price, subsidy_applied, final_price, payment_method, transaction_date) 
                              VALUES (?, ?, ?, 'public', ?, 0, ?, 'field sale', NOW())`;
      db.query(
        transactionSql,
        [productId, buyerName, phoneNumber, product.price, finalPrice],
        (err, result) => {
          if (err) return res.status(500).send('Error processing transaction');

          // Update stock after the transaction
          const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
          db.query(updateStockSql, [quantity, productId]);

          res.send('Public Sale completed successfully');
        }
      );
    });
  } catch (error) {
    console.error('Error processing public sale:', error);
    res.status(500).send('Error processing sale');
  }
};
// Get transactions for sales officers (filtered by 'field sale')
exports.getSalesTransactions = async (req, res) => {
    try {
      const sql = `
        SELECT t.*, p.name as product_name 
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.transaction_type IN ('subsidized', 'public') 
          AND t.payment_method = 'field sale'`;  // For field sales transactions only
      db.query(sql, (err, results) => {
        if (err) {
          return res.status(500).send('Error fetching transactions');
        }
        res.json(results);
      });
    } catch (error) {
      console.error('Error fetching sales transactions:', error);
      res.status(500).send('Error fetching transactions');
    }
  };
// Get all transactions for the admin
exports.getAllTransactions = async (req, res) => {
    try {
      const sql = `
        SELECT t.*, p.name as product_name 
        FROM transactions t
        JOIN products p ON t.product_id = p.id`;
      db.query(sql, (err, results) => {
        if (err) {
          return res.status(500).send('Error fetching transactions');
        }
        res.json(results);
      });
    } catch (error) {
      console.error('Error fetching admin transactions:', error);
      res.status(500).send('Error fetching transactions');
    }
  };
    // Update a transaction
exports.updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { buyer_name, phone_number, government_id, transaction_type, price, subsidy_applied, final_price, payment_method } = req.body;
  
    try {
      const sql = `
        UPDATE transactions 
        SET buyer_name = ?, phone_number = ?, government_id = ?, transaction_type = ?, price = ?, subsidy_applied = ?, final_price = ?, payment_method = ?
        WHERE id = ?`;
      db.query(sql, [buyer_name, phone_number, government_id, transaction_type, price, subsidy_applied, final_price, payment_method, id], (err, result) => {
        if (err) {
          return res.status(500).send('Error updating transaction');
        }
        res.send('Transaction updated successfully');
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).send('Error updating transaction');
    }
  };
  
  // Delete a transaction
  exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
  
    try {
      const sql = 'DELETE FROM transactions WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) {
          return res.status(500).send('Error deleting transaction');
        }
        if (result.affectedRows === 0) {
          return res.status(404).send('Transaction not found');
        }
        res.send('Transaction deleted successfully');
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).send('Error deleting transaction');
    }
  };
  
  // Add a new transaction
  exports.addTransaction = async (req, res) => {
    const { product_id, buyer_name, phone_number, government_id, transaction_type, price, subsidy_applied, final_price, payment_method } = req.body;
  
    try {
      const sql = `INSERT INTO transactions (product_id, buyer_name, phone_number, government_id, transaction_type, price, subsidy_applied, final_price, payment_method, transaction_date)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
      db.query(sql, [product_id, buyer_name, phone_number, government_id, transaction_type, price, subsidy_applied, final_price, payment_method], (err, result) => {
        if (err) {
          return res.status(500).send('Error adding transaction');
        }
        res.send('Transaction added successfully');
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      res.status(500).send('Error adding transaction');
    }
  };