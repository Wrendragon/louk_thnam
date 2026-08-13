import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client.js';

const empty = {
  category_id: '',
  name: '',
  brand: '',
  price: '',
  stock_quantity: '',
  image_url: '',
  description: '',
  how_to_use: '',
  requires_prescription: false
};

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Inline "add new category" state
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  function loadCategories() {
    return api.get('/categories').then((res) => setCategories(res.data.categories));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!editing) return;
    api.get(`/products/${id}`)
      .then((res) => {
        const p = res.data.product;
        setForm({
          category_id: p.category_id || '',
          name: p.name,
          brand: p.brand || '',
          price: p.price,
          stock_quantity: p.stock_quantity,
          image_url: p.image_url || '',
          description: p.description || '',
          how_to_use: p.how_to_use || '',
          requires_prescription: !!p.requires_prescription
        });
      })
      .catch(() => setError('Could not load product.'))
      .finally(() => setLoading(false));
  }, [id, editing]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    setCategoryError('');
    const name = newCategoryName.trim();
    if (!name) return;

    setAddingCategory(true);
    try {
      const res = await api.post('/categories', { category_name: name });
      await loadCategories();
      update('category_id', String(res.data.category.category_id)); // select the new category right away
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (err) {
      setCategoryError(err.response?.data?.error || 'Could not add category.');
    } finally {
      setAddingCategory(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name || form.price === '' || form.stock_quantity === '') {
      setError('Name, price, and stock quantity are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        category_id: form.category_id || null,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity)
      };
      if (editing) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save product.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="shell"><div className="loading-note">Loading…</div></div>;

  return (
    <div className="shell">
      <button className="back-link" onClick={() => navigate('/admin/products')}>← Back to products</button>
      <div className="panel" style={{ maxWidth: 680 }}>
        <div className="section-title">{editing ? 'Edit product' : 'Add new product'}</div>
        {error && <div className="alert err">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field full">
              <label>Product name</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </div>

            <div className="field full">
              <label>Brand</label>
              <input type="text" value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="e.g. Tylenol, Advil, generic/store brand" />
            </div>

            <div className="field">
              <label>Category</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} style={{ flex: 1 }}>
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="mini-btn"
                  style={{ flexShrink: 0 }}
                  onClick={() => setShowNewCategory((s) => !s)}
                >
                  {showNewCategory ? 'Cancel' : '+ New'}
                </button>
              </div>

              {showNewCategory && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    type="text"
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="mini-btn"
                    style={{ flexShrink: 0 }}
                    onClick={handleAddCategory}
                    disabled={addingCategory || !newCategoryName.trim()}
                  >
                    {addingCategory ? 'Adding…' : 'Add'}
                  </button>
                </div>
              )}
              {categoryError && (
                <div style={{ color: 'var(--red)', fontSize: 12.5, marginTop: 6 }}>{categoryError}</div>
              )}
            </div>

            <div className="field">
              <label>Price ($)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} required />
            </div>

            <div className="field">
              <label>Stock quantity</label>
              <input type="number" min="0" value={form.stock_quantity} onChange={(e) => update('stock_quantity', e.target.value)} required />
            </div>

            <div className="field" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <div className="checkbox-row">
                <input
                  id="rx"
                  type="checkbox"
                  checked={form.requires_prescription}
                  onChange={(e) => update('requires_prescription', e.target.checked)}
                />
                <label htmlFor="rx" style={{ margin: 0, textTransform: 'none', fontWeight: 400 }}>Requires prescription</label>
              </div>
            </div>

            <div className="field full">
              <label>Image URL</label>
              <input type="text" value={form.image_url} onChange={(e) => update('image_url', e.target.value)} placeholder="https://…" />
            </div>

            <div className="field full">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} />
            </div>

            <div className="field full">
              <label>How to use / dosage</label>
              <textarea value={form.how_to_use} onChange={(e) => update('how_to_use', e.target.value)} />
            </div>
          </div>

          <div className="btn-row">
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
            </button>
            <button className="btn-secondary" type="button" onClick={() => navigate('/admin/products')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
