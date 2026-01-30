import React from 'react';

function ShoppingList({ items, onToggleCheck, onRemove, onClear, onAddAll, hasActiveRecipe }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Shopping List</h2>
        <div className="item-count">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </div>
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
      {items.length > 0 && (
        <div className="sidebar-actions">
          <button className="btn btn-clear" onClick={onClear}>Clear All</button>
          {hasActiveRecipe && (
            <button className="btn btn-add-all" onClick={onAddAll}>+ Add All</button>
          )}
        </div>
      )}
    </div>
  );
}

export default ShoppingList;
