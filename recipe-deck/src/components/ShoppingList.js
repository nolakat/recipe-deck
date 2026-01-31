import React from 'react';

function ShoppingList({ items, onToggleCheck, onRemove, onClear, isOpen, onClose, onOpenLedger }) {
  return (
    <div className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sidebar-header">
        <h2>Shopping List</h2>
        <button className="sidebar-close-btn" onClick={onClose}>×</button>
      </div>
      <div className="sidebar-count">
        {items.length} item{items.length !== 1 ? 's' : ''}
      </div>
      <div className="shopping-list">
        {items.length === 0 ? (
          <div className="sidebar-empty">
            <div className="bag-icon">🛒</div>
            <div>Your list is empty</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>Click ingredients to add them</div>
          </div>
        ) : (
          items.map((item, i) => (
            <div key={`${item.name}-${item.qty}-${i}`} className={`shopping-item${item.checked ? ' checked' : ''}`}>
              <div className="si-check" onClick={() => onToggleCheck(i)}></div>
              <span className="si-qty">{item.qty}</span>
              <span className="si-text">{item.name}</span>
              <button className="si-remove" onClick={() => onRemove(i)}>×</button>
            </div>
          ))
        )}
      </div>
      <div className="sidebar-actions">
        {items.length > 0 && (
          <>
            <button className="btn btn-clear" onClick={onClear}>Clear All</button>
          </>
        )}
        <button className="btn btn-ledger" onClick={onOpenLedger}>Grocery Ledger</button>
      </div>
    </div>
  );
}

export default ShoppingList;
