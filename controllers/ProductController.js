const multer = require('multer');
const db = require('../models/db');

// Configure Multer for image upload (store image in memory as a buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 1. **Create**: Add a new product to the public or government inventory
exports.addProduct = [
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, description, price, stock, is_subsidized, subsidy_percentage } = req.body;
      const image = req.file ? req.file.buffer : null;
      const isSubsidized = is_subsidized === 'true' || is_subsidized === true ? 1 : 0;

      const sql = 'INSERT INTO products (name, description, price, stock, is_subsidized, subsidy_percentage, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(sql, [name, description, price, stock, isSubsidized, subsidy_percentage || 0, image], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Error adding product');
        }
        res.send('Product added successfully');
      });
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).send('Error adding product');
    }
  }
];

// 2. **Read**: Get all products (public and government inventory)
exports.getAllProducts = async (req, res) => {
  try {
    const sql = 'SELECT id, name, description, price, stock, is_subsidized, subsidy_percentage, image FROM products';
    db.query(sql, (err, results) => {
      if (err) {
        return res.status(500).send('Error fetching products');
      }
      // Convert image to base64 if image exists
      const products = results.map(product => ({
        ...product,
        image: product.image ? Buffer.from(product.image).toString('base64') : null,
      }));
      res.json(products);
    });
  } catch (error) {
    res.status(500).send('Error fetching products');
  }
};

// **Get a single product by ID**
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT id, name, description, price, stock, is_subsidized, subsidy_percentage, image FROM products WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        return res.status(500).send('Error fetching product');
      }
      if (result.length === 0) {
        return res.status(404).send('Product not found');
      }
      const product = result[0];
      product.image = product.image ? Buffer.from(product.image).toString('base64') : null; // Convert image to base64
      res.json(product);
    });
  } catch (error) {
    res.status(500).send('Error fetching product');
  }
};

// 3. **Update**: Update an existing product in the inventory
exports.updateProduct = [
    upload.single('image'), // Multer middleware to handle file upload
    async (req, res) => {
      try {
        const { id } = req.params;
        const { name, description, price, stock, is_subsidized, subsidy_percentage } = req.body;
        const image = req.file ? req.file.buffer : null; // Image is optional
  
        // Convert is_subsidized to integer (0 or 1)
        const isSubsidized = is_subsidized === 'true' || is_subsidized === true ? 1 : 0;
  
        // Construct SQL query dynamically based on whether an image is provided or not
        let sql;
        const params = [name, description, price, stock, isSubsidized, subsidy_percentage, id];
  
        if (image) {
          // If image is provided, update it
          sql = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, is_subsidized = ?, subsidy_percentage = ?, image = ? WHERE id = ?';
          params.splice(6, 0, image); // Insert image at index 6 in the params array
        } else {
          // If no image, don't update it
          sql = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, is_subsidized = ?, subsidy_percentage = ? WHERE id = ?';
        }
  
        db.query(sql, params, (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error updating product');
          }
          if (result.affectedRows === 0) {
            return res.status(404).send('Product not found');
          }
          res.send('Product updated successfully');
        });
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Error updating product');
      }
    }
  ];
  

// 4. **Delete**: Remove a product from the inventory
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'DELETE FROM products WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        return res.status(500).send('Error deleting product');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Product not found');
      }
      res.send('Product deleted successfully');
    });
  } catch (error) {
    res.status(500).send('Error deleting product');
  }
};

// 5. **Handle Government Sales**: Sales with subsidy logic
exports.handleGovSale = async (req, res) => {
  const { productId, quantity, farmerId } = req.body;
  try {
    // Fetch the product with subsidy information
    const sqlGetProduct = 'SELECT stock, price, subsidy_percentage FROM products WHERE id = ? AND is_subsidized = 1';
    db.query(sqlGetProduct, [productId], (err, result) => {
      if (err || result.length === 0) {
        return res.status(404).send('Subsidized product not found or unavailable');
      }

      const { stock, price, subsidy_percentage } = result[0];

      if (stock < quantity) {
        return res.status(400).send('Not enough stock available');
      }

      // Deduct stock from the government inventory
      const sqlUpdateStock = 'UPDATE products SET stock = stock - ? WHERE id = ?';
      db.query(sqlUpdateStock, [quantity, productId], (err, updateResult) => {
        if (err) {
          return res.status(500).send('Error updating stock');
        }

        // Calculate subsidy and farmer's payment based on subsidy percentage
        const totalCost = price * quantity;
        const governmentSubsidy = (totalCost * subsidy_percentage) / 100;
        const farmerPayment = totalCost - governmentSubsidy;

        // Log the sale transaction
        const sqlLogSale = 'INSERT INTO transactions (product_id, farmer_id, quantity, sale_date, farmer_payment, government_subsidy, sale_type) VALUES (?, ?, ?, NOW(), ?, ?, "government")';
        db.query(sqlLogSale, [productId, farmerId, quantity, farmerPayment, governmentSubsidy], (err, saleResult) => {
          if (err) {
            return res.status(500).send('Error logging sale');
          }

          // Return success response with detailed breakdown
          res.json({
            message: 'Government sale processed successfully',
            productId,
            quantity,
            totalCost,
            farmerPayment,
            governmentSubsidy,
          });
        });
      });
    });
  } catch (error) {
    res.status(500).send('Error processing government-subsidized sale');
  }
};

// 6. **Handle Public Sales**: Sales from public inventory
exports.handlePublicSale = async (req, res) => {
  const { productId, quantity, customerId } = req.body;
  try {
    const sqlGetStock = 'SELECT stock FROM products WHERE id = ? AND is_subsidized = 0';
    db.query(sqlGetStock, [productId], (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).send('Error fetching product stock');
      }
      const stock = result[0].stock;

      if (stock < quantity) {
        return res.status(400).send('Not enough stock available');
      }

      // Deduct stock from public inventory
      const sqlUpdateStock = 'UPDATE products SET stock = stock - ? WHERE id = ?';
      db.query(sqlUpdateStock, [quantity, productId], (err, updateResult) => {
        if (err) {
          return res.status(500).send('Error updating stock');
        }

        // Log the sale
        const sqlLogSale = 'INSERT INTO transactions (product_id, customer_id, quantity, sale_date, sale_type) VALUES (?, ?, ?, NOW(), "public")';
        db.query(sqlLogSale, [productId, customerId, quantity], (err, saleResult) => {
          if (err) {
            return res.status(500).send('Error logging sale');
          }

          res.send('Public sale recorded successfully');
        });
      });
    });
  } catch (error) {
    res.status(500).send('Error handling public sale');
  }
};

// 7. **View Transactions**: For admins to view all sales (both public and government)
exports.getAllTransactions = async (req, res) => {
  try {
    const sql = 'SELECT * FROM transactions';
    db.query(sql, (err, results) => {
      if (err) {
        return res.status(500).send('Error fetching transactions');
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).send('Error fetching transactions');
  }
};
