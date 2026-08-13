import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

function readCachedUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Hydrate synchronously from localStorage first, so the navbar shows the
  // name/role immediately on page load/refresh instead of flashing "logged
  // out" while the /me request is in flight.
  const [user, setUser] = useState(readCachedUser);
  const [loading, setLoading] = useState(true);

  // Then verify the token against the server in the background. Only log
  // the user out on an actual 401 (invalid/expired token) — a transient
  // network error shouldn't wipe a valid session from the UI.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
        // Otherwise (network/server error): keep the cached user so the
        // UI stays usable, and try again next load.
      })
      .finally(() => setLoading(false));
  }, []);

  function persistSession(token, userData) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  function setUserFromApi(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  const value = {
    user,
    loading,
    isAdmin: user?.role_name === 'Admin',
    login,
    register,
    logout,
    setUserFromApi
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
