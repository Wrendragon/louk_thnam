const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ---------- GET /api/products  (public — no login required) ----------
// Optional ?category_id=# filter, used by the storefront.
router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;
    let sql = `
      SELECT p.*, c.category_name
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
    `;
    const params = [];
    if (category_id) {
      sql += ' WHERE p.category_id = ?';
      params.push(category_id);
    }
    sql += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load products.' });
  }
});

// ---------- GET /api/products/:id  (public) ----------
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.category_name
       FROM products p
       LEFT JOIN categories c ON c.category_id = p.category_id
       WHERE p.product_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
    res.json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load product.' });
  }
});

// ---------- POST /api/products  (admin only) ----------
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { category_id, name, brand, price, stock_quantity, image_url, description, how_to_use, requires_prescription } = req.body;

    if (!name || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and stock quantity are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO products
        (category_id, name, brand, price, stock_quantity, image_url, description, how_to_use, requires_prescription)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id || null, name, brand || null, price, stock_quantity, image_url || null, description || null, how_to_use || null, !!requires_prescription]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [result.insertId]);
    res.status(201).json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create product.' });
  }
});

// ---------- PUT /api/products/:id  (admin only) ----------
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { category_id, name, brand, price, stock_quantity, image_url, description, how_to_use, requires_prescription } = req.body;

    const [existing] = await pool.query('SELECT product_id FROM products WHERE product_id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Product not found.' });

    await pool.query(
      `UPDATE products SET
        category_id = ?, name = ?, brand = ?, price = ?, stock_quantity = ?,
        image_url = ?, description = ?, how_to_use = ?, requires_prescription = ?
       WHERE product_id = ?`,
      [category_id || null, name, brand || null, price, stock_quantity, image_url || null, description || null, how_to_use || null, !!requires_prescription, req.params.id]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [req.params.id]);
    res.json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update product.' });
  }
});

// ---------- DELETE /api/products/:id  (admin only) ----------
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE product_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete product.' });
  }
});

module.exports = router;
