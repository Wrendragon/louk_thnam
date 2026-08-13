import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contactName, setContactName] = useState(user?.full_name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone_number || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  if (confirmation) {
    return (
      <div className="shell narrow">
        <div className="ticket">
          <div className="auth-eyebrow">Order placed</div>
          <h1 className="auth-title">Thank you, {confirmation.contact_name.split(' ')[0]}</h1>
          <div className="alert ok">Your order has been received and is pending confirmation.</div>

          <div className="dosage-box" style={{ marginBottom: 20 }}>
            Order #{String(confirmation.order_id).padStart(4, '0')}<br />
            Total: ${Number(confirmation.total_amount).toFixed(2)}<br />
            Deliver to: {confirmation.delivery_address}<br />
            Contact: {confirmation.contact_name} · {confirmation.contact_phone}
          </div>

          <Link to="/shop" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Continue shopping
          </Link>
          <Link to="/orders" className="auth-foot" style={{ display: 'block', marginTop: 14 }}>
            View order history →
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="shell">
        <div className="panel">
          <div className="empty-note">
            Your cart is empty. <Link to="/shop" style={{ color: 'var(--amber)', fontWeight: 600 }}>Browse the shop →</Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!contactName.trim() || !contactPhone.trim() || !deliveryAddress.trim()) {
      setError('Contact name, phone, and delivery address are all required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        delivery_address: deliveryAddress.trim()
      });
      setConfirmation(res.data.order);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shell">
      <button className="back-link" onClick={() => navigate('/cart')}>← Back to cart</button>

      <div className="page-head">
        <div className="page-eyebrow">Almost done</div>
        <h1 className="page-title">Checkout</h1>
      </div>

      <div className="cart-layout">
        <div className="panel">
          {error && <div className="alert err">{error}</div>}
          <div className="section-title">Delivery & contact</div>
          <form onSubmit={handleSubmit} id="checkout-form">
            <div className="field">
              <label>Contact name</label>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Contact phone</label>
              <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="555-0123" required />
            </div>
            <div className="field">
              <label>Delivery location / address</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Street address, city, and any delivery notes"
                required
              />
            </div>
          </form>
        </div>

        <div className="panel cart-summary">
          <div className="section-title">Order summary</div>
          {items.map((i) => (
            <div className="cart-summary-row" key={i.product_id}>
              <span>{i.name} × {i.quantity}</span>
              <span className="mono">${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="cart-summary-row total">
            <span>Total</span>
            <span className="mono">${total.toFixed(2)}</span>
          </div>
          <button className="btn-primary" type="submit" form="checkout-form" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  );
}
