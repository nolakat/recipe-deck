import React, { useEffect, useState } from 'react';

function IngredientCard({ ingredient, isAdded, onClick, delay }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`ingredient-card${visible ? ' visible' : ''}${isAdded ? ' added' : ''}`}
      onClick={onClick}
    >
      <span className="ing-qty">{ingredient.qty}</span>
      <span className="ing-name">{ingredient.name}</span>
      <span className="ing-add">{isAdded ? '✓' : '+'}</span>
    </div>
  );
}

export default IngredientCard;
