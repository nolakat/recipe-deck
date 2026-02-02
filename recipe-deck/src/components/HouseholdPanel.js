import React, { useState } from 'react';

function HouseholdPanel({ items, shoppingList, onAdd, onRemove, onToggle, isOpen, onClose }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), String(qty));
    setName('');
    setQty(1);
  };

  const isOnList = (item) =>
    shoppingList.some(s => s.name === item.name && s.qty === item.qty);

  return (
    <div className={`household-panel${isOpen ? ' open' : ''}`}>
      <div className="sidebar-header">
        <h2>Household</h2>
        <button className="sidebar-close-btn" onClick={onClose}>×</button>
      </div>
      <div className="sidebar-count">{items.length} items</div>

      <form className="household-add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="household-input"
        />
        <div className="household-qty-stepper">
          <button type="button" className="qty-step-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>‹</button>
          <span className="qty-step-value">{qty}</span>
          <button type="button" className="qty-step-btn" onClick={() => setQty(q => q + 1)}>›</button>
        </div>
        <button type="submit" className="household-add-btn" disabled={!name.trim()}>+</button>
      </form>

      <div className="household-items">
        {items.length === 0 ? (
          <div className="sidebar-empty">
            <div className="bag-icon">🧴</div>
            <div>Add household items here</div>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className={`household-item${isOnList(item) ? ' added' : ''}`}
              onClick={() => onToggle({ name: item.name, qty: item.qty })}
            >
              <span className="household-item-name">{item.name}</span>
              <span className="household-item-qty">{item.qty}</span>
              <button
                className="household-item-delete"
                onClick={e => { e.stopPropagation(); onRemove(item.id); }}
              >×</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HouseholdPanel;
