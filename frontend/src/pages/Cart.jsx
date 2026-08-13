import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FALLBACK_IMG = 'https://placehold.co/120x120/EFEAdc/7C9885?text=No+Image';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleCheckout() {
    navigate(user ? '/checkout' : '/login');
  }

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-eyebrow">Your cart</div>
        <h1 className="page-title">Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="panel">
          <div className="empty-note">
            Your cart is empty. <Link to="/shop" style={{ color: 'var(--amber)', fontWeight: 600 }}>Browse the shop →</Link>
          </div>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="panel cart-items">
            {items.map((item) => (
              <div className="cart-row" key={item.product_id}>
                <img
                  src={item.image_url || FALLBACK_IMG}
                  alt={item.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
                />
                <div className="cart-row-info">
                  <div className="table-name">{item.name}</div>
                  <div className="mono" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>${item.price.toFixed(2)} each</div>
                </div>
                <div className="qty-stepper">
                  <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    disabled={item.stock_quantity != null && item.quantity >= item.stock_quantity}
                  >
                    +
                  </button>
                </div>
                <div className="cart-row-total mono">${(item.price * item.quantity).toFixed(2)}</div>
                <button className="mini-btn danger" onClick={() => removeFromCart(item.product_id)}>Cancel</button>
              </div>
            ))}
          </div>

          <div className="panel cart-summary">
            <div className="section-title">Order summary</div>
            <div className="cart-summary-row">
              <span>Items</span>
              <span className="mono">{items.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <span className="mono">${total.toFixed(2)}</span>
            </div>
            <button className="btn-primary" onClick={handleCheckout}>
              {user ? 'Proceed to checkout' : 'Log in to check out'}
            </button>
            <Link to="/shop" className="auth-foot" style={{ display: 'block', marginTop: 14 }}>
              ← Add more items
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
