const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ---------- POST /api/orders  (place an order from the cart) ----------
// Body: { items: [{ product_id, quantity }], contact_name, contact_phone, delivery_address }
// Price is always looked up server-side — never trust a price sent by the client.
router.post('/', requireAuth, async (req, res) => {
  const { items, contact_name, contact_phone, delivery_address } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }
  if (!contact_name || !contact_phone || !delivery_address) {
    return res.status(400).json({ error: 'Contact name, phone, and delivery address are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;
    const lineItems = [];

    for (const item of items) {
      const [rows] = await conn.query('SELECT * FROM products WHERE product_id = ? FOR UPDATE', [item.product_id]);
      const product = rows[0];
      if (!product) { const e = new Error(`Product not found (id ${item.product_id}).`); e.status = 400; throw e; }

      const qty = Number(item.quantity) || 0;
      if (qty <= 0) { const e = new Error(`Invalid quantity for ${product.name}.`); e.status = 400; throw e; }
      if (product.stock_quantity < qty) {
        const e = new Error(`Not enough stock for ${product.name}. Only ${product.stock_quantity} left.`);
        e.status = 400;
        throw e;
      }

      total += Number(product.price) * qty;
      lineItems.push({ product_id: product.product_id, quantity: qty, unit_price: product.price });
    }

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, total_amount, order_status, contact_name, contact_phone, delivery_address)
       VALUES (?, ?, 'Pending', ?, ?, ?)`,
      [req.user.user_id, total, contact_name, contact_phone, delivery_address]
    );
    const order_id = orderResult.insertId;

    for (const li of lineItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [order_id, li.product_id, li.quantity, li.unit_price]
      );
      await conn.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
        [li.quantity, li.product_id]
      );
    }

    await conn.commit();

    res.status(201).json({
      order: { order_id, total_amount: total, order_status: 'Pending', contact_name, contact_phone, delivery_address }
    });
  } catch (err) {
    await conn.rollback();
    if (err.status) {
      res.status(err.status).json({ error: err.message });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Could not place order. Please try again.' });
    }
  } finally {
    conn.release();
  }
});

// ---------- GET /api/orders/mine  (the logged-in user's own order history) ----------
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.user_id]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, p.name, p.image_url, p.stock_quantity, p.price AS current_price
         FROM order_items oi
         JOIN products p ON p.product_id = oi.product_id
         WHERE oi.order_id = ?`,
        [order.order_id]
      );
      order.items = items;
    }

    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load your orders.' });
  }
});

module.exports = router;
