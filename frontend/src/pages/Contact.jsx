import React, { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // No backend endpoint is wired up for this form yet — it just confirms
    // receipt locally. Add a POST /api/contact route + a `messages` table
    // if you want inquiries actually stored/emailed.
    setSent(true);
  }

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-eyebrow">Get in touch</div>
        <h1 className="page-title">Contact</h1>
        <p className="static-page-lead">
          Questions about an order, a medication, or anything else — reach out and a real
          person will get back to you.
        </p>
      </div>

      <div className="contact-grid">
        <div className="panel">
          <div className="section-title">Send a message</div>
          {sent ? (
            <div className="alert ok">Thanks, {form.name || 'there'} — we've got your message and will reply soon.</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Name</label>
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              </div>
              <div className="field">
                <label>Message</label>
                <textarea value={form.message} onChange={(e) => update('message', e.target.value)} style={{ minHeight: 120 }} required />
              </div>
              <button className="btn-primary" type="submit">Send message</button>
            </form>
          )}
        </div>

        <div className="panel">
          <div className="section-title">Store details</div>
          <div className="contact-info-item">
            <div className="contact-info-label">Phone</div>
            <div className="contact-info-value">+855 964 355 014</div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-label">Email</div>
            <div className="contact-info-value">Hongbunkheang12@gmail.com</div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-label">Address</div>
            <div className="contact-info-value">Phnom Penh, Cambodia</div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-label">Hours</div>
            <div className="contact-info-value">Mon–Sat, 8am–8pm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
