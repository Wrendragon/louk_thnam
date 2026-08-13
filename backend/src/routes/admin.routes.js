const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

// ---------- GET /api/admin/stats ----------
router.get('/stats', async (req, res) => {
  try {
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
    const [[{ low_stock }]] = await pool.query('SELECT COUNT(*) AS low_stock FROM products WHERE stock_quantity < 10');
    const [[{ total_customers }]] = await pool.query(
      `SELECT COUNT(*) AS total_customers FROM users u JOIN roles r ON r.role_id = u.role_id WHERE r.role_name = 'User'`
    );
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ revenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS revenue FROM orders WHERE order_status IN ('Paid','Shipped')`
    );

    res.json({
      total_products,
      low_stock,
      total_customers,
      total_orders,
      revenue: Number(revenue)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load dashboard stats.' });
  }
});

// ---------- GET /api/admin/orders ----------
router.get('/orders', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.order_id, o.total_amount, o.order_status, o.created_at,
              o.delivery_address, o.contact_name, o.contact_phone, u.full_name, u.email
       FROM orders o
       JOIN users u ON u.user_id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT 50`
    );
    res.json({ orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load orders.' });
  }
});

// ---------- GET /api/admin/low-stock ----------
router.get('/low-stock', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.category_name FROM products p
       LEFT JOIN categories c ON c.category_id = p.category_id
       WHERE p.stock_quantity < 10
       ORDER BY p.stock_quantity ASC`
    );
    res.json({ products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load low-stock products.' });
  }
});

module.exports = router;
