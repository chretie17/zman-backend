const db = require('../models/db');

exports.getDashboardData = async (req, res) => {
  try {
    let cards = {};
    let graphs = {};

    // Query 1: Total Transactions, Revenue, Subsidy
    db.query(
      `SELECT COUNT(*) AS total_transactions, SUM(final_price) AS total_revenue, SUM(subsidy_applied) AS total_subsidy FROM transactions`,
      (err, totalSalesResult) => {
        if (err) {
          console.error('Error fetching total sales:', err);
          return res.status(500).send('Error fetching total sales');
        }

        cards.totalTransactions = totalSalesResult[0]?.total_transactions || 0;
        cards.totalRevenue = totalSalesResult[0]?.total_revenue || 0;
        cards.totalSubsidy = totalSalesResult[0]?.total_subsidy || 0;

        // Query 2: Active Beneficiaries
        db.query(
          `SELECT COUNT(DISTINCT beneficiary_national_id) AS active_beneficiaries FROM transactions WHERE transaction_type = 'subsidized'`,
          (err, activeBeneficiariesResult) => {
            if (err) {
              console.error('Error fetching active beneficiaries:', err);
              return res.status(500).send('Error fetching active beneficiaries');
            }

            cards.activeBeneficiaries = activeBeneficiariesResult[0]?.active_beneficiaries || 0;

            // Query 3: Revenue Breakdown by Transaction Type
            db.query(
              `SELECT transaction_type, COUNT(*) AS transaction_count, SUM(final_price) AS total_revenue FROM transactions GROUP BY transaction_type`,
              (err, salesByTypeResult) => {
                if (err) {
                  console.error('Error fetching sales by type:', err);
                  return res.status(500).send('Error fetching sales by type');
                }

                graphs.salesByType = salesByTypeResult;

                // Query 4: Top-Selling Products
                db.query(
                  `SELECT p.name AS product_name, COUNT(t.id) AS transaction_count, SUM(t.final_price) AS total_revenue FROM transactions t JOIN products p ON t.product_id = p.id GROUP BY t.product_id ORDER BY total_revenue DESC LIMIT 5`,
                  (err, topProductsResult) => {
                    if (err) {
                      console.error('Error fetching top products:', err);
                      return res.status(500).send('Error fetching top products');
                    }

                    graphs.topProducts = topProductsResult;

                    // Query 5: Subsidy Breakdown
                    db.query(
                      `SELECT p.name AS product_name, SUM(t.subsidy_applied) AS total_subsidy, COUNT(t.id) AS transaction_count FROM transactions t JOIN products p ON t.product_id = p.id WHERE t.transaction_type = 'subsidized' GROUP BY t.product_id ORDER BY total_subsidy DESC LIMIT 5`,
                      (err, subsidyBreakdownResult) => {
                        if (err) {
                          console.error('Error fetching subsidy breakdown:', err);
                          return res.status(500).send('Error fetching subsidy breakdown');
                        }

                        graphs.subsidyBreakdown = subsidyBreakdownResult;

                        // Send Final Response
                        res.json({ cards, graphs });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send('Error fetching dashboard data');
  }
};
