import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';

export default function Profile() {
  const { user, setUserFromApi } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (newPassword && newPassword !== newPassword2) {
      setError('New passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        full_name: fullName,
        phone_number: phone,
        avatar_url: avatarUrl
      };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await api.put('/auth/me', payload);
      setUserFromApi(res.data.user);
      setNotice('Profile updated.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPassword2('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shell narrow">
      <button className="back-link" onClick={() => navigate(-1)}>← Back</button>

      <div className="ticket">
        <div className="auth-eyebrow">Your account</div>
        <h1 className="auth-title">Profile</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <Avatar user={{ full_name: fullName, avatar_url: avatarUrl }} size={56} />
          <div>
            <div style={{ fontWeight: 600, fontFamily: "'Fraunces',serif", fontSize: 17, color: 'var(--pine)' }}>
              {fullName || user.full_name}
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{user.email} · {user.role_name}</div>
          </div>
        </div>

        {error && <div className="alert err">{error}</div>}
        {notice && <div className="alert ok">{notice}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Phone number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="555-0123" />
          </div>
          <div className="field">
            <label>Profile picture URL</label>
            <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
          </div>

          <hr className="hr" />
          <div className="detail-section-label">Change password (optional)</div>

          <div className="field">
            <label>Current password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required only if setting a new password" />
          </div>
          <div className="field">
            <label>New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current password" />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input type="password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} />
          </div>

          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
