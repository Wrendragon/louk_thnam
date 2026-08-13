import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/orders'),
      api.get('/admin/low-stock')
    ])
      .then(([statsRes, ordersRes, lowStockRes]) => {
        setStats(statsRes.data);
        setOrders(ordersRes.data.orders);
        setLowStock(lowStockRes.data.products);
      })
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="shell"><div className="loading-note">Loading dashboard…</div></div>;
  if (error) return <div className="shell"><div className="alert err">{error}</div></div>;

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-eyebrow">Admin</div>
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total products</div>
          <div className="stat-value">{stats.total_products}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Low stock (&lt;10)</div>
          <div className="stat-value">{stats.low_stock}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Registered customers</div>
          <div className="stat-value">{stats.total_customers}</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Revenue to date</div>
          <div className="stat-value">${stats.revenue.toFixed(2)}</div>
        </div>
      </div>

      <div className="panel">
        <div className="section-title">Recent orders</div>
        {orders.length === 0 ? (
          <div className="empty-note">No orders yet.</div>
        ) : (
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Contact</th><th>Deliver to</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.order_id}>
                  <td className="mono">#{String(o.order_id).padStart(4, '0')}</td>
                  <td>{o.full_name}</td>
                  <td>{o.contact_name}<br /><span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{o.contact_phone}</span></td>
                  <td style={{ maxWidth: 220 }}>{o.delivery_address}</td>
                  <td>{o.order_status}</td>
                  <td className="mono">${Number(o.total_amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="section-title">Low stock alerts</div>
        {lowStock.length === 0 ? (
          <div className="empty-note">Everything is well stocked.</div>
        ) : (
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Remaining</th></tr></thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.product_id}>
                  <td className="table-name">{p.name}</td>
                  <td>{p.category_name}</td>
                  <td className="mono" style={{ color: 'var(--red)' }}>
                    {p.stock_quantity === 0 ? 'Out of stock' : p.stock_quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
