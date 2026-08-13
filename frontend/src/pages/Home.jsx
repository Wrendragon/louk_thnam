import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/products').then((res) => setFeatured(res.data.products.slice(0, 4))).catch(() => {});
    api.get('/categories').then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="hero">
        <div className="hero-inner">
          <div className="page-eyebrow">Louk Thnam</div>
          <h1 className="hero-title">Everyday medicine,<br />handled with care.</h1>
          <p className="hero-sub">
            Browse trusted over-the-counter remedies and prescription medicine, see exactly
            what's in stock, and order for delivery — no account needed until you're ready to check out.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn-primary" style={{ width: 'auto', padding: '13px 28px', textDecoration: 'none' }}>
              Shop now
            </Link>
            <Link to="/about" className="btn-secondary" style={{ width: 'auto', padding: '13px 28px', textDecoration: 'none' }}>
              Learn more
            </Link>
          </div>
        </div>
      </div>

      <div className="shell">
        <div className="trust-row">
          <div className="trust-item">
            <div className="trust-title">Verified stock</div>
            <div className="trust-sub">Live inventory, no guessing</div>
          </div>
          <div className="trust-item">
            <div className="trust-title">Rx clearly labeled</div>
            <div className="trust-sub">Prescription items flagged upfront</div>
          </div>
          <div className="trust-item">
            <div className="trust-title">Clear dosage info</div>
            <div className="trust-sub">How-to-use on every product</div>
          </div>
        </div>

        {categories.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 8 }}>Shop by category</div>
            <div className="filters" style={{ marginBottom: 36 }}>
              {categories.map((c) => (
                <Link key={c.category_id} to={`/shop?category=${c.category_id}`} className="chip">
                  {c.category_name}
                </Link>
              ))}
            </div>
          </>
        )}

        {featured.length > 0 && (
          <>
            <div className="section-title">Featured products</div>
            <div className="grid">
              {featured.map((p) => <ProductCard key={p.product_id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
