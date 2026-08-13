import React, { useState } from 'react';

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function Avatar({ user, size = 32 }) {
  const [broken, setBroken] = useState(false);
  const hasImage = user?.avatar_url && !broken;

  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'var(--pine)',
    color: '#fff',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: Math.max(10, size * 0.36),
    fontWeight: 500,
    letterSpacing: '.3px'
  };

  if (hasImage) {
    return (
      <div style={style}>
        <img
          src={user.avatar_url}
          alt={user.full_name || 'Profile'}
          onError={() => setBroken(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return <div style={style}>{initials(user?.full_name)}</div>;
}
