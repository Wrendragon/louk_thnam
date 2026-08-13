import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function load() {
    setLoading(true);
    api.get('/products')
      .then((res) => setProducts(res.data.products))
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.product_id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete product.');
    }
  }

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-eyebrow">Admin</div>
        <h1 className="page-title">Products</h1>
      </div>

      <div className="panel">
        <div className="row-actions-top">
          <div className="section-title" style={{ margin: 0 }}>All products ({products.length})</div>
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 18px', marginTop: 0 }} onClick={() => navigate('/admin/products/new')}>
            + Add product
          </button>
        </div>

        {error && <div className="alert err">{error}</div>}
        {loading ? (
          <div className="loading-note">Loading…</div>
        ) : products.length === 0 ? (
          <div className="empty-note">No products yet.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Rx</th><th></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.product_id}>
                  <td className="table-name">{p.name}</td>
                  <td>{p.category_name || '—'}</td>
                  <td className="mono">${Number(p.price).toFixed(2)}</td>
                  <td className="mono" style={p.stock_quantity < 10 ? { color: 'var(--red)' } : undefined}>{p.stock_quantity}</td>
                  <td>{p.requires_prescription ? 'Yes' : '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="mini-btn" onClick={() => navigate(`/admin/products/${p.product_id}/edit`)}>Edit</button>
                      <button className="mini-btn danger" onClick={() => handleDelete(p.product_id, p.name)}>Delete</button>
                    </div>
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
