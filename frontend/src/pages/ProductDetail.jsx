import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';

const FALLBACK_IMG = 'https://placehold.co/500x500/EFEAdc/7C9885?text=No+Image';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then((res) => { setProduct(res.data.product); setQty(1); setAdded(false); })
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="shell"><div className="loading-note">Loading…</div></div>;
  if (error || !product) return <div className="shell"><div className="empty-note">{error || 'Product not found.'}</div></div>;

  const low = product.stock_quantity > 0 && product.stock_quantity < 10;
  const out = product.stock_quantity === 0;

  function handleAddToCart() {
    addToCart(product, qty);
    setAdded(true);
  }

  return (
    <div className="shell">
      <button className="back-link" onClick={() => navigate('/shop')}>← Back to shop</button>
      <div className="label-ticket">
        <div className="label-image">
          <img
            src={product.image_url || FALLBACK_IMG}
            alt={product.name}
            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
          />
        </div>
        <div className="label-main">
          <div className="detail-cat">{product.category_name || 'Uncategorized'}</div>
          <h1 className="detail-title">{product.name}</h1>
          {product.brand && <div className="detail-brand">by {product.brand}</div>}

          <div className="detail-price-row">
            <span className="detail-price">${Number(product.price).toFixed(2)}</span>
            {product.requires_prescription ? <span className="badge-rx">Prescription required</span> : null}
          </div>

          <div className="detail-section-label">Product info</div>
          <p className="detail-text">{product.description}</p>

          <hr className="hr" />

          <div className="detail-section-label">How to use</div>
          <div className="dosage-box">{product.how_to_use}</div>

          <div className="stock-line">
            {out ? (
              <span style={{ color: 'var(--red)' }}>● Out of stock</span>
            ) : low ? (
              <span style={{ color: 'var(--red)' }}>● Only {product.stock_quantity} left in stock</span>
            ) : (
              <span style={{ color: 'var(--sage)' }}>● In stock — {product.stock_quantity} available</span>
            )}
          </div>

          {!out && (
            <div className="cart-add-row">
              <div className="qty-stepper">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}>+</button>
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '11px 24px', marginTop: 0 }} onClick={handleAddToCart}>
                Add to cart
              </button>
            </div>
          )}

          {added && (
            <div className="alert ok" style={{ marginTop: 16 }}>
              Added to cart. <Link to="/cart" style={{ fontWeight: 700, color: 'var(--pine)' }}>View cart</Link> or keep browsing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
