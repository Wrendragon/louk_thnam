import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Store() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/products')])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.categories);
        setProducts(prodRes.data.products);
      })
      .catch(() => setError('Could not load products. Is the API server running?'))
      .finally(() => setLoading(false));
  }, []);

  function selectCategory(id) {
    setActiveCategory(id);
    setSearchParams(id === 'all' ? {} : { category: id });
  }

  const visible = activeCategory === 'all'
    ? products
    : products.filter((p) => String(p.category_id) === String(activeCategory));

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-eyebrow">Shop</div>
        <h1 className="page-title">Browse the shelf</h1>
        <p className="page-sub">
          Everything here is open to browse — no account needed. Create one only when you're
          ready to check out or track an order.
        </p>
      </div>

      {error && <div className="alert err">{error}</div>}

      {!error && (
        <>
          <div className="filters">
            <button className={`chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.category_id}
                className={`chip ${String(activeCategory) === String(c.category_id) ? 'active' : ''}`}
                onClick={() => setActiveCategory(c.category_id)}
              >
                {c.category_name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-note">Loading products…</div>
          ) : (
            <div className="grid">
              {visible.length === 0 ? (
                <div className="empty-note">No products in this category yet.</div>
              ) : (
                visible.map((p) => <ProductCard key={p.product_id} product={p} />)
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
