const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { user_id: user.user_id, role_id: user.role_id, role_name: user.role_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(row) {
  return {
    user_id: row.user_id,
    full_name: row.full_name,
    email: row.email,
    phone_number: row.phone_number,
    avatar_url: row.avatar_url || null,
    role_id: row.role_id,
    role_name: row.role_name
  };
}

// ---------- POST /api/auth/register ----------
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone_number } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // role_id 2 = 'User' (default customer role, per Schema.sql)
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, phone_number, role_id) VALUES (?, ?, ?, ?, 2)',
      [full_name, email, password_hash, phone_number || null]
    );

    const [rows] = await pool.query(
      `SELECT u.*, r.role_name FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.user_id = ?`,
      [result.insertId]
    );
    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ---------- POST /api/auth/login ----------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await pool.query(
      `SELECT u.*, r.role_name FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.email = ?`,
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ---------- GET /api/auth/me ----------
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, r.role_name FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.user_id = ?`,
      [req.user.user_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: publicUser(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load profile.' });
  }
});

// ---------- POST /api/auth/forgot-password ----------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const [rows] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);

    // Always return the same generic message so we never reveal whether
    // an email is registered (standard security practice).
    const genericResponse = {
      message: `If an account exists for ${email}, a password reset link has been sent.`
    };

    if (rows.length === 0) {
      return res.json(genericResponse);
    }

    const user_id = rows[0].user_id;
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user_id, token, expires_at]
    );

    // In production this token is emailed to the user via a mailer
    // (SendGrid, SES, Nodemailer, etc.) instead of being returned here.
    // TODO: wire up a real email provider before shipping.
    console.log(`[password reset] token for ${email}: ${token}`);

    if (process.env.NODE_ENV !== 'production') {
      // Convenience only for local development/testing without an email server.
      genericResponse.dev_reset_token = token;
    }

    res.json(genericResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not process request. Please try again.' });
  }
});

// ---------- POST /api/auth/reset-password ----------
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
    }

    const reset = rows[0];
    const password_hash = await bcrypt.hash(password, 10);

    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [password_hash, reset.user_id]);
    await pool.query('DELETE FROM password_resets WHERE reset_id = ?', [reset.reset_id]);

    res.json({ message: 'Password updated. You can now log in with your new password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not reset password. Please try again.' });
  }
});

// ---------- PUT /api/auth/me  (update own profile) ----------
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { full_name, phone_number, avatar_url, current_password, new_password } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.user.user_id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    const existing = rows[0];

    // Changing the password requires confirming the current one.
    let password_hash = existing.password_hash;
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Enter your current password to set a new one.' });
      }
      const ok = await bcrypt.compare(current_password, existing.password_hash);
      if (!ok) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }
      if (new_password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      password_hash = await bcrypt.hash(new_password, 10);
    }

    await pool.query(
      `UPDATE users SET full_name = ?, phone_number = ?, avatar_url = ?, password_hash = ? WHERE user_id = ?`,
      [full_name.trim(), phone_number || null, avatar_url || null, password_hash, req.user.user_id]
    );

    const [updatedRows] = await pool.query(
      `SELECT u.*, r.role_name FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.user_id = ?`,
      [req.user.user_id]
    );
    res.json({ user: publicUser(updatedRows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

module.exports = router;
