import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [devToken, setDevToken] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setNotice(res.data.message);
      if (res.data.dev_reset_token) setDevToken(res.data.dev_reset_token);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not process request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shell narrow">
      <div className="ticket">
        <div className="auth-eyebrow">Account recovery</div>
        <h1 className="auth-title">Forgot password</h1>

        {error && <div className="alert err">{error}</div>}
        {notice ? (
          <div className="alert ok">{notice}</div>
        ) : (
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: -14, marginBottom: 20 }}>
            Enter your account email and we'll send a link to reset your password.
          </p>
        )}

        {devToken && (
          <p style={{ fontSize: 12, color: 'var(--sage)', wordBreak: 'break-all', marginBottom: 20 }}>
            Dev mode only — no email server configured. Reset token: <span className="mono">{devToken}</span>
            <br />Use the Reset Password page with this token to set a new password.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <div className="auth-foot"><Link to="/login">Back to log in</Link></div>
        {devToken && <div className="auth-foot"><Link to="/reset-password">Go to reset password page</Link></div>}
      </div>
    </div>
  );
}
