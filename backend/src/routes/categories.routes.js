const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ---------- GET /api/categories  (public) ----------
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY category_name');
    res.json({ categories: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load categories.' });
  }
});

// ---------- POST /api/categories  (admin only) ----------
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name) return res.status(400).json({ error: 'Category name is required.' });

    const [result] = await pool.query('INSERT INTO categories (category_name) VALUES (?)', [category_name]);
    const [rows] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [result.insertId]);
    res.status(201).json({ category: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create category (name may already exist).' });
  }
});

module.exports = router;
