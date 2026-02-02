import React, { useState } from 'react';

function SavedPlans({ savedPlans, selectedRecipes, onSave, onLoad, onDelete, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const sorted = [...savedPlans].sort((a, b) => b.date.localeCompare(a.date));
  const isEmpty = selectedRecipes.length === 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Saved Plans</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="saved-plans-section">
          <div className="saved-plans-section-label">Save Current Plan</div>
          <div className="saved-plans-row">
            <div className="modal-field" style={{ flex: 1, marginBottom: 0 }}>
              <label>Week of</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <button
              className="btn-modal-save"
              disabled={isEmpty}
              onClick={() => { onSave(date); }}
              style={{ alignSelf: 'flex-end' }}
            >
              Save Current Plan
            </button>
          </div>
          {isEmpty && <div className="saved-plans-hint">Add recipes to your meal plan first.</div>}
        </div>

        <div className="saved-plans-section" style={{ marginTop: 24 }}>
          <div className="saved-plans-section-label">Load a Saved Plan</div>
          {sorted.length === 0 ? (
            <div className="saved-plans-hint">No saved plans yet.</div>
          ) : (
            <>
              <div className="saved-plans-list">
                {sorted.map(plan => (
                  <div
                    key={plan.id}
                    className={`saved-plan-item${selectedPlanId === plan.id ? ' selected' : ''}`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <span className="saved-plan-date">{plan.date}</span>
                    <span className="saved-plan-count">{plan.plan.length} cards</span>
                    <button
                      className="saved-plan-delete"
                      onClick={(e) => { e.stopPropagation(); onDelete(plan.id); if (selectedPlanId === plan.id) setSelectedPlanId(''); }}
                      title="Delete this plan"
                    >×</button>
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                <button
                  className="btn-modal-save"
                  disabled={!selectedPlanId}
                  onClick={() => { onLoad(selectedPlanId); onClose(); }}
                >
                  Load Plan
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SavedPlans;
