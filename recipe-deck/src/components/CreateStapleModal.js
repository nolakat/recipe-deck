import React, { useState } from 'react';

function CreateStapleModal({ onSave, onClose, staple }) {
  const isEdit = !!staple;
  const [name, setName] = useState(staple ? staple.name : '');
  const [emoji, setEmoji] = useState(staple ? staple.emoji : '🛒');
  const [qty, setQty] = useState(staple ? staple.qty : '');
  const [favorite, setFavorite] = useState(staple ? !!staple.favorite : false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !qty.trim()) return;
    onSave({
      id: isEdit ? staple.id : `s${Date.now()}`,
      emoji,
      name: name.trim(),
      qty: qty.trim(),
      category: 'pantry',
      favorite,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Staple' : 'Add Staple'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-row">
            <div className="modal-field">
              <label>Emoji</label>
              <input type="text" value={emoji} onChange={e => setEmoji(e.target.value)} style={{ textAlign: 'center', fontSize: 24 }} />
            </div>
            <div className="modal-field" style={{ flex: 2 }}>
              <label>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bread" required autoFocus />
            </div>
          </div>
          <div className="modal-field">
            <label>Quantity</label>
            <input type="text" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 1 loaf" required />
          </div>
          <div className="modal-field modal-checkbox-field">
            <label>
              <input type="checkbox" checked={favorite} onChange={e => setFavorite(e.target.checked)} />
              Favorite
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-modal-save">{isEdit ? 'Save Changes' : 'Add Staple'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStapleModal;
