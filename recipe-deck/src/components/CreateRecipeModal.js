import React, { useState } from 'react';

const CATEGORY_EMOJI = {
  breakfast: '🍳',
  lunch: '🥪',
  dinner: '🍽️',
  treats: '🍰',
};

function CreateRecipeModal({ onSave, onClose, recipe }) {
  const isEdit = !!recipe;
  const [name, setName] = useState(recipe ? recipe.name : '');
  const [servings, setServings] = useState(recipe ? recipe.servings : 2);
  const [category, setCategory] = useState(recipe ? recipe.category : 'breakfast');
  const [ingredients, setIngredients] = useState(recipe ? recipe.ingredients.map(i => ({ ...i })) : [{ name: '', qty: '' }]);

  const addRow = () => setIngredients(prev => [...prev, { name: '', qty: '' }]);

  const removeRow = (i) => {
    if (ingredients.length <= 1) return;
    setIngredients(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateIngredient = (i, field, value) => {
    setIngredients(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.qty.trim());
    onSave({
      id: isEdit ? recipe.id : Date.now(),
      emoji: CATEGORY_EMOJI[category],
      name: name.trim(),
      desc: name.trim(),
      servings: Number(servings),
      category,
      time: isEdit ? recipe.time : undefined,
      ingredients: validIngredients,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Recipe' : 'Add Recipe'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Recipe name" required autoFocus />
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label>Servings</label>
              <input type="number" value={servings} onChange={e => setServings(e.target.value)} min="1" required />
            </div>
            <div className="modal-field">
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="breakfast">☀️ Breakfast</option>
                <option value="lunch">🌤️ Lunch</option>
                <option value="dinner">🌙 Dinner</option>
                <option value="treats">🍬 Treats</option>
              </select>
            </div>
          </div>
          <div className="modal-field">
            <label>Ingredients</label>
            <div className="ingredient-rows">
              {ingredients.map((ing, i) => (
                <div key={i} className="ingredient-row">
                  <input type="number" placeholder="Qty" value={ing.qty} onChange={e => updateIngredient(i, 'qty', e.target.value)} className="ingredient-qty-input" min="0" />
                  <input type="text" placeholder="Ingredient" value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} />
                  {ingredients.length > 1 && (
                    <button type="button" className="btn-remove-ingredient" onClick={() => removeRow(i)}>×</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="btn-add-ingredient" onClick={addRow}>+ Add ingredient</button>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-modal-save">{isEdit ? 'Save Changes' : 'Add Recipe'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRecipeModal;
