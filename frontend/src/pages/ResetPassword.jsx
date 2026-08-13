import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== password2) return setError('Passwords do not match.');

    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setNotice(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shell narrow">
      <div className="ticket">
        <div className="auth-eyebrow">Account recovery</div>
        <h1 className="auth-title">Reset password</h1>
        {error && <div className="alert err">{error}</div>}
        {notice && <div className="alert ok">{notice}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Reset token</label>
            <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the token from your email" required />
          </div>
          <div className="field">
            <label>New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Repeat password" required />
          </div>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Set new password'}
          </button>
        </form>
        <div className="auth-foot"><Link to="/login">Back to log in</Link></div>
      </div>
    </div>
  );
}
