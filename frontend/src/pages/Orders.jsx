import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';

const STATUS_CLASS = {
  Pending: 'status-pending',
  Paid: 'status-paid',
  Shipped: 'status-shipped',
  Cancelled: 'status-cancelled'
};

function formatDate(value) {
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [buyAgainNote, setBuyAgainNote] = useState(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders/mine')
      .then((res) => setOrders(res.data.orders))
      .catch(() => setError('Could not load your order history.'))
      .finally(() => setLoading(false));
  }, []);

  function handleBuyAgain(order, e) {
    e.stopPropagation(); // don't toggle the row open/closed

    const added = [];
    const skipped = [];
    const reduced = [];

    for (const it of order.items) {
      const stock = it.stock_quantity ?? 0;
      const price = it.current_price ?? it.unit_price;

      if (stock <= 0) {
        skipped.push(it.name);
        continue;
      }

      const qty = Math.min(it.quantity, stock);
      if (qty < it.quantity) reduced.push(it.name);

      addToCart(
        {
          product_id: it.product_id,
          name: it.name,
          price: Number(price),
          image_url: it.image_url,
          stock_quantity: stock
        },
        qty
      );
      added.push(it.name);
    }

    if (added.length === 0) {
      setBuyAgainNote({ type: 'err', text: 'None of the items from this order are in stock right now.' });
      return;
    }

    let text = `Added ${added.length} item${added.length > 1 ? 's' : ''} from order #${String(order.order_id).padStart(4, '0')} to your cart.`;
    if (reduced.length > 0) text += ` Reduced quantity for: ${reduced.join(', ')} (limited stock).`;
    if (skipped.length > 0) text += ` Skipped (out of stock): ${skipped.join(', ')}.`;

    setBuyAgainNote({ type: skipped.length > 0 || reduced.length > 0 ? 'err' : 'ok', text });
    setTimeout(() => navigate('/cart'), skipped.length > 0 || reduced.length > 0 ? 1800 : 700);
  }

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-eyebrow">Your account</div>
        <h1 className="page-title">Order history</h1>
        <p className="page-sub">Everything you've bought, most recent first.</p>
      </div>

      {error && <div className="alert err">{error}</div>}
      {buyAgainNote && <div className={`alert ${buyAgainNote.type}`}>{buyAgainNote.text}</div>}

      {loading ? (
        <div className="loading-note">Loading your orders…</div>
      ) : orders.length === 0 ? (
        <div className="panel">
          <div className="empty-note">
            No orders yet. <Link to="/shop" style={{ color: 'var(--amber)', fontWeight: 600 }}>Browse the shop →</Link>
          </div>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((o) => {
            const open = openId === o.order_id;
            return (
              <div className="panel order-card" key={o.order_id}>
                <div className="order-card-head" onClick={() => setOpenId(open ? null : o.order_id)} role="button" tabIndex={0}>
                  <div>
                    <div className="table-name mono">#{String(o.order_id).padStart(4, '0')}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{formatDate(o.created_at)}</div>
                  </div>
                  <div className={`order-status ${STATUS_CLASS[o.order_status] || ''}`}>{o.order_status}</div>
                  <div className="mono" style={{ fontWeight: 600, color: 'var(--pine)' }}>${Number(o.total_amount).toFixed(2)}</div>
                  <button className="mini-btn" onClick={(e) => handleBuyAgain(o, e)}>Buy again</button>
                  <div className="order-card-chevron">{open ? '▲' : '▼'}</div>
                </div>

                {open && (
                  <div className="order-card-body">
                    <div className="detail-section-label">Items</div>
                    <table>
                      <thead><tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Subtotal</th></tr></thead>
                      <tbody>
                        {o.items.map((it) => (
                          <tr key={it.order_item_id}>
                            <td>{it.name}</td>
                            <td className="mono">{it.quantity}</td>
                            <td className="mono">${Number(it.unit_price).toFixed(2)}</td>
                            <td className="mono">${(it.unit_price * it.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="hr" style={{ margin: '16px 0' }} />

                    <div className="detail-section-label">Delivered to</div>
                    <p className="detail-text" style={{ marginBottom: 0 }}>
                      {o.contact_name} · {o.contact_phone}<br />
                      {o.delivery_address}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
