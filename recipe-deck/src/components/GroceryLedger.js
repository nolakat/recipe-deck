import React, { useState } from 'react';

function GroceryLedger({ entries, onAdd, onDelete, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [store, setStore] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(today);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!store.trim() || !cost) return;
    onAdd({ store: store.trim(), cost: parseFloat(cost), date });
    setStore('');
    setCost('');
    setDate(today);
  };

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const total = entries.reduce((sum, e) => sum + e.cost, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal ledger-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Grocery Ledger</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="ledger-form">
          <div className="modal-row" style={{ gridTemplateColumns: '1fr 100px' }}>
            <div className="modal-field">
              <label>Store</label>
              <input value={store} onChange={e => setStore(e.target.value)} placeholder="Store name" />
            </div>
            <div className="modal-field">
              <label>Cost</label>
              <input type="number" min="0" step="0.01" value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div className="modal-row" style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="modal-field">
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="modal-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn-modal-save" disabled={!store.trim() || !cost}>+ Add</button>
            </div>
          </div>
        </form>

        <div className="ledger-entries">
          {sorted.length === 0 ? (
            <div className="ledger-empty">No entries yet. Log your first grocery trip above.</div>
          ) : (
            sorted.map((entry) => (
              <div key={entry.id} className="ledger-entry">
                <span className="ledger-date">{entry.date}</span>
                <span className="ledger-store">{entry.store}</span>
                <span className="ledger-cost">${entry.cost.toFixed(2)}</span>
                <button className="ledger-delete" onClick={() => onDelete(entry.id)}>×</button>
              </div>
            ))
          )}
        </div>

        {entries.length > 0 && (
          <div className="ledger-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroceryLedger;
