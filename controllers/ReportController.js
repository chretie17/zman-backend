const db = require('../models/db2');

// Helper function to format government payments data

// Helper function to format orders data
const formatOrders = (results) => {
  return results.map(order => ({
    orderId: order.id,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    totalPrice: order.total_price,
    orderDate: order.order_date,
    status: order.status,
    products: order.products.split(', '), // Assumes GROUP_CONCAT used for product names
  }));
};

// Report Controller with date range filtering
exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "Invalid date range: Start date must be earlier than end date" });
    }

    // Apply date filtering if provided
    const dateFilter = startDate && endDate ? ` AND transaction_date BETWEEN ? AND ?` : '';

    // Queries to fetch various report data
    const totalSalesQuery = `SELECT SUM(total_price) AS total_sales 
                             FROM orders WHERE status IN ('Delivered', 'Received')`;

    const totalPendingQuery = `SELECT SUM(total_price) AS total_pending_amount 
                               FROM orders WHERE status = 'Pending'`;

    const revenueBreakdownQuery = `SELECT 
                                   SUM(CASE WHEN transaction_type = 'public' THEN final_price ELSE 0 END) AS total_public_revenue,
                                   SUM(CASE WHEN transaction_type = 'subsidized' THEN final_price ELSE 0 END) AS total_subsidized_revenue,
                                   SUM(CASE WHEN transaction_type = 'subsidized' THEN subsidy_applied ELSE 0 END) AS total_subsidy_given
                                   FROM transactions WHERE 1=1 ${dateFilter}`;

    const inventoryReportQuery = `SELECT p.id, p.name, 
                                  p.stock - COALESCE(SUM(t.final_price / p.price), 0) AS remaining_stock 
                                  FROM products p 
                                  LEFT JOIN transactions t ON p.id = t.product_id 
                                  GROUP BY p.id, p.name`;

    const governmentPaymentsQuery = `SELECT t.buyer_name, t.phone_number, 
                                    p.name AS product_name, t.subsidy_applied, t.final_price, t.transaction_date 
                                    FROM transactions t 
                                    JOIN products p ON t.product_id = p.id
                                    WHERE t.transaction_type = 'subsidized' ${dateFilter}`;

    // Fetch orders data
    const ordersQuery = `SELECT o.id, o.customer_email, o.customer_phone, o.total_price, o.order_date, o.status,
                         GROUP_CONCAT(p.name SEPARATOR ', ') AS products
                         FROM orders o
                         JOIN order_items oi ON o.id = oi.order_id
                         JOIN products p ON oi.product_id = p.id
                         GROUP BY o.id`;

    // Execute queries
    const [totalSalesResult, totalPendingResult, revenueBreakdownResult, inventoryReportResult, governmentPaymentsResult, ordersResult] = await Promise.all([
      db.query(totalSalesQuery),
      db.query(totalPendingQuery),
      db.query(revenueBreakdownQuery, [startDate, endDate]),
      db.query(inventoryReportQuery),
      db.query(governmentPaymentsQuery, [startDate, endDate]),
      db.query(ordersQuery)
    ]);

    // Construct the report
    const report = {
      total_sales: totalSalesResult[0][0]?.total_sales || 0,
      total_pending_amount: totalPendingResult[0][0]?.total_pending_amount || 0,
      revenue_breakdown: {
        total_public_revenue: revenueBreakdownResult[0][0]?.total_public_revenue || 0,
        total_subsidized_revenue: revenueBreakdownResult[0][0]?.total_subsidized_revenue || 0,
        total_subsidy_given: revenueBreakdownResult[0][0]?.total_subsidy_given || 0,
      },
      inventory_report: inventoryReportResult[0],
      government_payments: formatGovernmentPayments(governmentPaymentsResult[0]),
      orders: formatOrders(ordersResult[0])
    };

    // Send the report
    res.json({ message: "Report generated successfully", report });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Error generating report" });
  }
};




// Helper function to format subsidized inventory data

// Helper function to format government payments data
const formatGovernmentPayments = (results) => {
  return results.map((row) => ({
    buyerName: row.beneficiary_name || 'N/A',
    phoneNumber: row.beneficiary_phone || 'N/A',
    productName: row.product_name || 'N/A',
    subsidyApplied: row.subsidy_applied || 0,
    finalPrice: row.final_price || 0,
    transactionDate: row.transaction_date || 'N/A',
  }));
};

// Helper function to format subsidized inventory data
const formatSubsidizedInventory = (results) => {
  return results.map((product) => ({
    productId: product.id || 'N/A',
    productName: product.name || 'N/A',
    remainingStock: product.remaining_stock || 0,
  }));
};

// Generate a detailed government subsidy report
exports.generateGovernmentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

// Adjust endDate to include full day
const adjustedEndDate = endDate ? adjustEndDateToEndOfDay(endDate) : null;

const dateFilter = startDate && adjustedEndDate ? `AND t.transaction_date BETWEEN ? AND ?` : '';

    // Queries
    const totalSubsidyQuery = `
      SELECT SUM(t.subsidy_applied) AS total_subsidy_given
      FROM transactions t
      WHERE t.transaction_type = 'subsidized' ${dateFilter}
    `;

    const subsidizedRevenueQuery = `
      SELECT SUM(t.final_price) AS total_subsidized_revenue
      FROM transactions t
      WHERE t.transaction_type = 'subsidized' ${dateFilter}
    `;

    const recipientListQuery = `
      SELECT 
        t.beneficiary_name AS beneficiary_name,
        t.beneficiary_phone AS beneficiary_phone,
        p.name AS product_name,
        t.subsidy_applied,
        t.final_price,
        t.transaction_date
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      WHERE t.transaction_type = 'subsidized' ${dateFilter}
    `;

    const subsidizedInventoryQuery = `
      SELECT 
        p.id AS id,
        p.name AS name,
        p.stock - COALESCE(SUM(t.final_price / p.price), 0) AS remaining_stock
      FROM products p
      LEFT JOIN transactions t ON p.id = t.product_id
      WHERE p.is_subsidized = 1
      GROUP BY p.id, p.name
    `;

    // Execute queries in parallel
    const [totalSubsidyResult, subsidizedRevenueResult, recipientListResult, subsidizedInventoryResult] =
    await Promise.all([
      db.query(totalSubsidyQuery, [startDate, adjustedEndDate]),
      db.query(subsidizedRevenueQuery, [startDate, adjustedEndDate]),
      db.query(recipientListQuery, [startDate, adjustedEndDate]),
      db.query(subsidizedInventoryQuery),
    ]);
  

    // Format the results
    const report = {
      totalSubsidyGiven: totalSubsidyResult[0][0]?.total_subsidy_given || 0,
      totalSubsidizedRevenue: subsidizedRevenueResult[0][0]?.total_subsidized_revenue || 0,
      recipients: formatGovernmentPayments(recipientListResult[0]),
      subsidizedInventory: formatSubsidizedInventory(subsidizedInventoryResult[0]),
    };

    res.json({ message: 'Government subsidy report generated successfully', report });
  } catch (error) {
    console.error('Error generating government report:', error);
    res.status(500).send({ message: 'Error generating government report', error: error.message });
  }
};
// Helper to adjust endDate to 23:59:59
const adjustEndDateToEndOfDay = (dateString) => {
  const date = new Date(dateString);
  date.setHours(23, 59, 59, 999);
  return date.toISOString().slice(0, 19).replace('T', ' '); // Format as 'YYYY-MM-DD HH:MM:SS'
};
