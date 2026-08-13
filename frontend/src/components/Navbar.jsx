import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Avatar from './Avatar.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="wordmark">
          <span className="cross">✚</span>Louk Thnam
        </Link>
        <div className="nav-links">
          {isAdmin ? (
            <>
              <Link className={`nav-btn ${path === '/admin' ? 'active' : ''}`} to="/admin">Dashboard</Link>
              <Link className={`nav-btn ${path.startsWith('/admin/products') ? 'active' : ''}`} to="/admin/products">Products</Link>
            </>
          ) : (
            <>
              <Link className={`nav-btn ${path === '/' ? 'active' : ''}`} to="/">Home</Link>
              <Link className={`nav-btn ${path === '/shop' || path.startsWith('/product') ? 'active' : ''}`} to="/shop">Shop</Link>
              <Link className={`nav-btn ${path === '/about' ? 'active' : ''}`} to="/about">About</Link>
              <Link className={`nav-btn ${path === '/contact' ? 'active' : ''}`} to="/contact">Contact</Link>
              <Link className={`nav-cart ${path === '/cart' || path === '/checkout' ? 'active' : ''}`} to="/cart" title="Cart">
                🛒
                {count > 0 && <span className="nav-cart-badge">{count}</span>}
              </Link>
            </>
          )}

          {user ? (
            <>
              {!isAdmin && (
                <Link className={`nav-btn ${path === '/orders' ? 'active' : ''}`} to="/orders">Orders</Link>
              )}
              <Link to="/profile" className="user-badge" title="Edit profile">
                <Avatar user={user} size={26} />
                <span className="user-badge-text">
                  <span className="user-badge-name">{user.full_name || user.email || 'Account'}</span>
                </span>
              </Link>
              <button className="nav-btn ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className={`nav-btn ${path === '/login' ? 'active' : ''}`} to="/login">Log in</Link>
              <Link className="nav-btn ghost" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
