import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone_number: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.password2) return setError('Passwords do not match.');

    setSubmitting(true);
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        phone_number: form.phone_number,
        password: form.password
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shell narrow">
      <div className="ticket">
        <div className="auth-eyebrow">Create account</div>
        <h1 className="auth-title">Register</h1>
        {error && <div className="alert err">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="Jane Doe" required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label>Phone number</label>
            <input type="tel" value={form.phone_number} onChange={(e) => update('phone_number', e.target.value)} placeholder="555-0123" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="At least 6 characters" required />
          </div>
          <div className="field">
            <label>Confirm password</label>
            <input type="password" value={form.password2} onChange={(e) => update('password2', e.target.value)} placeholder="Repeat password" required />
          </div>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <div className="auth-foot">Already registered? <Link to="/login">Log in</Link></div>
      </div>
    </div>
  );
}
