import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

function readCart() {
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.product_id);
      const cap = product.stock_quantity ?? Infinity;

      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, cap);
        return prev.map((i) => (i.product_id === product.product_id ? { ...i, quantity: nextQty } : i));
      }

      return [
        ...prev,
        {
          product_id: product.product_id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url,
          stock_quantity: product.stock_quantity,
          quantity: Math.min(quantity, cap)
        }
      ];
    });
  }

  // Set a specific quantity (used by the +/- stepper). Quantity 0 removes the item.
  function updateQuantity(product_id, quantity) {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.product_id !== product_id);
      return prev.map((i) =>
        i.product_id === product_id
          ? { ...i, quantity: Math.min(quantity, i.stock_quantity ?? Infinity) }
          : i
      );
    });
  }

  function removeFromCart(product_id) {
    setItems((prev) => prev.filter((i) => i.product_id !== product_id));
  }

  function clearCart() {
    setItems([]);
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
