import React from 'react';

export default function About() {
  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-eyebrow">About us</div>
        <h1 className="page-title">Louk Thnam</h1>
        <p className="static-page-lead">
          We're a neighborhood pharmacy that moved online without losing the parts that
          actually matter — clear dosage information, honest stock levels, and a straightforward
          way to reach a real person when you have a question.
        </p>
      </div>

      <div className="panel">
        <div className="section-title">What we do</div>
        <p className="detail-text">
          Meridian Apothecary carries everyday over-the-counter remedies alongside prescription
          medicine, all listed with plain-language usage instructions. Every product page shows
          what's actually in stock, whether a prescription is required, and how to take it safely.
          No account is needed to browse — only to check out or track an order.
        </p>
      </div>

      <div className="value-grid">
        <div className="value-card">
          <h3>Clear labeling</h3>
          <p>Every product lists dosage, usage, and prescription status up front — no digging through fine print.</p>
        </div>
        <div className="value-card">
          <h3>Real stock levels</h3>
          <p>What you see in the shop reflects what's actually on the shelf, updated as orders come in.</p>
        </div>
        <div className="value-card">
          <h3>People, not just tickets</h3>
          <p>Questions about an order or a medication go to a real pharmacist, not a chatbot loop.</p>
        </div>
      </div>
    </div>
  );
}
