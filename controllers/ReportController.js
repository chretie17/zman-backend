const db = require('../models/db2');

// Helper function to format government payments data
const formatGovernmentPayments = (results) => {
  return results.map(row => ({
    buyerName: row.buyer_name || 'N/A',
    phoneNumber: row.phone_number || 'N/A',
    productName: row.product_name,
    subsidyApplied: row.subsidy_applied,
    finalPrice: row.final_price,
  }));
};

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
exports.generateGovernmentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = startDate && endDate ? ` AND transaction_date BETWEEN '${startDate}' AND '${endDate}'` : '';

    // 1. Total Subsidy Given
    const totalSubsidyQuery = `SELECT SUM(subsidy_applied) AS total_subsidy_given 
                               FROM transactions 
                               WHERE transaction_type = 'subsidized' ${dateFilter}`;

    // 2. Subsidized Revenue
    const subsidizedRevenueQuery = `SELECT SUM(final_price) AS total_subsidized_revenue 
                                    FROM transactions 
                                    WHERE transaction_type = 'subsidized' ${dateFilter}`;

    // 3. List of Farmers/Recipients
    const recipientListQuery = `SELECT t.buyer_name, t.phone_number, p.name AS product_name, 
                                       t.subsidy_applied, t.final_price 
                                FROM transactions t 
                                JOIN products p ON t.product_id = p.id 
                                WHERE t.transaction_type = 'subsidized' ${dateFilter}`;

    // 4. Inventory Status of Subsidized Products
    const subsidizedInventoryQuery = `SELECT p.id, p.name, p.stock - COALESCE(SUM(t.final_price / p.price), 0) AS remaining_stock 
                                      FROM products p 
                                      LEFT JOIN transactions t ON p.id = t.product_id 
                                      WHERE p.is_subsidized = 1 
                                      GROUP BY p.id, p.name`;

    const [totalSubsidyResult, subsidizedRevenueResult, recipientListResult, subsidizedInventoryResult] = await Promise.all([
      db.query(totalSubsidyQuery),
      db.query(subsidizedRevenueQuery),
      db.query(recipientListQuery),
      db.query(subsidizedInventoryQuery)
    ]);

    const report = {
      total_subsidy_given: totalSubsidyResult[0]?.total_subsidy_given || 0,
      total_subsidized_revenue: subsidizedRevenueResult[0]?.total_subsidized_revenue || 0,
      recipients: recipientListResult,
      subsidized_inventory: subsidizedInventoryResult
    };

    res.json({ message: 'Government report generated successfully', report });
  } catch (error) {
    console.error('Error generating government report:', error);
    res.status(500).send('Error generating government report');
  }
};
