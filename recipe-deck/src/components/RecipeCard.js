import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function CardContent({ recipe, onEdit, onDelete }) {
  const isPantry = recipe.category === 'pantry';
  return (
    <>
      <div>
        <div className="card-emoji-row">
          <span className="card-emoji">{recipe.emoji}</span>
          <span className="card-category-badge">
            {recipe.category === 'breakfast' ? '☀️' : recipe.category === 'lunch' ? '🌤️' : recipe.category === 'dinner' ? '🌙' : recipe.category === 'pantry' ? '🛒' : '🍬'}
          </span>
        </div>
        <div className="card-title">{recipe.name}</div>
        {!isPantry && recipe.desc && <div className="card-desc">{recipe.desc}</div>}
        {isPantry && recipe.qty && <div className="card-qty">{recipe.qty}</div>}
      </div>
      {(onEdit || onDelete) && (
        <div className="card-actions">
          {onEdit && <button className="card-action-btn" onClick={(e) => { e.stopPropagation(); onEdit(recipe); }} title="Edit">✏️</button>}
          {onDelete && <button className="card-action-btn" onClick={(e) => { e.stopPropagation(); onDelete(recipe.id); }} title="Delete">🗑</button>}
        </div>
      )}
      {recipe.favorite && <span className="card-favorite-badge">💚</span>}
      {!isPantry && (
        <div className="card-meta">
          <span className="time">⏱ {recipe.time}</span>
          <span className="servings">👤 {recipe.servings}</span>
        </div>
      )}
    </>
  );
}

export function SortableCard({ recipe, isGhost, from = 'selected', onEdit, onDelete }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({
    id: recipe.id,
    data: { recipe, from },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const className = [
    'recipe-card',
    recipe.favorite && 'favorite',
    (isDragging || isGhost) && 'drag-source',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      className={className}
      style={style}
      {...listeners}
      {...attributes}
    >
      <CardContent recipe={recipe} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

export function OverlayCard({ recipe }) {
  return (
    <div className="recipe-card drag-overlay">
      <CardContent recipe={recipe} />
    </div>
  );
}
