import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const FALLBACK_IMG = "https://placehold.co/400x300/EFEAdc/7C9885?text=No+Image";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const low = product.stock_quantity > 0 && product.stock_quantity < 10;
  const out = product.stock_quantity === 0;

  function handleAdd(e) {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="card">
      <div className="card-top">
        <img
          src={product.image_url || FALLBACK_IMG}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMG;
          }}
        />
      </div>
      <div className="card-body">
        <div className="card-cat">
          {product.category_name || "Uncategorized"}
        </div>
        <div className="card-name">{product.name}</div>
        {product.brand && <div className="card-brand">{product.brand}</div>}
        <div className="card-foot">
          <span className="card-price">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.requires_prescription ? (
            <span className="badge-rx">Rx only</span>
          ) : (
            <span className={`badge-stock ${low ? "badge-low" : ""}`}>
              {out
                ? "Out of stock"
                : low
                  ? `${product.stock_quantity} left`
                  : "In stock"}
            </span>
          )}
        </div>
        <div className="card-btn-row">
          <button
            className="view-btn"
            onClick={() => navigate(`/product/${product.product_id}`)}
          >
            View details
          </button>
          <button className="add-cart-btn" onClick={handleAdd} disabled={out}>
            {added ? "Added ✓" : out ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
