import React, { useState, useCallback, useRef } from 'react';
import {
  DndContext, DragOverlay, useDroppable,
  PointerSensor, TouchSensor, useSensor, useSensors,
  pointerWithin, rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { SortableCard, OverlayCard } from './components/RecipeCard';
import recipes from './data/recipes';
import IngredientCard from './components/IngredientCard';
import ShoppingList from './components/ShoppingList';
import './App.css';

function DroppableArea({ id, className, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`${className}${isOver ? ' drop-hover' : ''}`}>
      {children}
    </div>
  );
}

// Custom collision detection: prefer droppable zones over sortable items
function customCollision(args) {
  // First try pointerWithin for precision
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    // Prefer droppable zone ids (day-X-Y or deck-zone) over card ids
    const zoneHit = pointerCollisions.find(c =>
      String(c.id).startsWith('day-') || String(c.id) === 'deck-zone'
    );
    if (zoneHit) return [zoneHit];
    return pointerCollisions;
  }
  // Fallback to rect intersection
  const rectCollisions = rectIntersection(args);
  const zoneHit = rectCollisions.find(c =>
    String(c.id).startsWith('day-') || String(c.id) === 'deck-zone'
  );
  if (zoneHit) return [zoneHit];
  return rectCollisions;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_SLOTS = [
  { key: 'breakfast', label: '☀️', title: 'Breakfast' },
  { key: 'lunch', label: '🌤️', title: 'Lunch' },
  { key: 'dinner', label: '🌙', title: 'Dinner' },
  { key: 'treats', label: '🍬', title: 'Snacks' },
];

// Parse a droppable id like "day-3-breakfast" → { day: 3, slot: 'breakfast' }
function parseDropId(idStr) {
  const match = idStr.match(/^day-(\d+)-(\w+)$/);
  if (match) return { day: parseInt(match[1], 10), slot: match[2] };
  return null;
}

function App() {
  // selectedRecipes: [{ id, day, slot }, ...]
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const fromRef = useRef(null);
  const snapshotRef = useRef([]);

  const [people, setPeople] = useState(1);
  const [activeFilter, setActiveFilter] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } })
  );

  const isInList = useCallback((ing) => {
    return shoppingList.some(s => s.name === ing.name && s.qty === ing.qty);
  }, [shoppingList]);

  const getSpan = (recipe) => Math.ceil(recipe.servings / people);

  // Check if a recipe is allowed in a given slot
  const recipeMatchesSlot = (recipeId, slot) => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe && recipe.category === slot;
  };

  const handleDragStart = (event) => {
    const recipe = event.active.data.current.recipe;
    const from = event.active.data.current.from;
    setActiveRecipe(recipe);
    fromRef.current = from;
    snapshotRef.current = [...selectedRecipes];
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const id = active.id;
    const from = fromRef.current;
    const overIdStr = String(over.id);
    const isInSelected = selectedRecipes.some(e => e.id === id);
    const parsed = parseDropId(overIdStr);
    const isDeckZone = overIdStr === 'deck-zone';

    if (from === 'deck') {
      if (parsed && recipeMatchesSlot(id, parsed.slot) && !isInSelected) {
        setSelectedRecipes(prev => [...prev, { id, day: parsed.day, slot: parsed.slot }]);
      } else if (parsed && recipeMatchesSlot(id, parsed.slot) && isInSelected) {
        setSelectedRecipes(prev => prev.map(e => e.id === id ? { ...e, day: parsed.day, slot: parsed.slot } : e));
      } else if (isDeckZone && isInSelected) {
        setSelectedRecipes(prev => prev.filter(e => e.id !== id));
      }
    }

    if (from === 'selected') {
      if (parsed && recipeMatchesSlot(id, parsed.slot)) {
        setSelectedRecipes(prev => prev.map(e => e.id === id ? { ...e, day: parsed.day, slot: parsed.slot } : e));
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    const id = active.id;
    const from = fromRef.current;

    if (!over) {
      setSelectedRecipes(snapshotRef.current);
    } else {
      const overIdStr = String(over.id);
      const parsed = parseDropId(overIdStr);

      if (from === 'selected' && overIdStr === 'deck-zone') {
        setSelectedRecipes(prev => prev.filter(e => e.id !== id));
      } else if (from === 'selected' && parsed && recipeMatchesSlot(id, parsed.slot)) {
        setSelectedRecipes(prev => prev.map(e => e.id === id ? { ...e, day: parsed.day, slot: parsed.slot } : e));
      } else if (from === 'deck' && parsed && recipeMatchesSlot(id, parsed.slot)) {
        // Ensure the card lands where it was last dragged over
        setSelectedRecipes(prev => {
          const exists = prev.some(e => e.id === id);
          if (exists) return prev.map(e => e.id === id ? { ...e, day: parsed.day, slot: parsed.slot } : e);
          return [...prev, { id, day: parsed.day, slot: parsed.slot }];
        });
      }
    }

    setActiveRecipe(null);
    fromRef.current = null;
  };

  const handleDragCancel = () => {
    setSelectedRecipes(snapshotRef.current);
    setActiveRecipe(null);
    fromRef.current = null;
  };

  const toggleIngredient = (ing) => {
    setShoppingList(prev => {
      const idx = prev.findIndex(s => s.name === ing.name && s.qty === ing.qty);
      if (idx > -1) return prev.filter((_, i) => i !== idx);
      return [...prev, { ...ing }];
    });
  };

  const addAllIngredients = () => {
    if (selectedRecipes.length === 0) return;
    const allIngs = selectedRecipes.flatMap(entry =>
      recipes.find(r => r.id === entry.id).ingredients
    );
    setShoppingList(prev => {
      const newItems = allIngs.filter(
        ing => !prev.some(s => s.name === ing.name && s.qty === ing.qty)
      );
      return [...prev, ...newItems.map(ing => ({ ...ing }))];
    });
  };

  const clearList = () => setShoppingList([]);
  const removeItem = (index) => setShoppingList(prev => prev.filter((_, i) => i !== index));
  const toggleCheck = (index) => {
    setShoppingList(prev =>
      prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
    );
  };

  const selectedRecipeData = selectedRecipes.map(entry => ({
    ...recipes.find(r => r.id === entry.id),
    day: entry.day,
    slot: entry.slot,
  }));
  const selectedIds = selectedRecipes.map(e => e.id);
  const deckRecipes = recipes.filter(r => !selectedIds.includes(r.id));

  const categories = [
    { key: null, label: 'All' },
    { key: 'breakfast', label: '☀️ Breakfast' },
    { key: 'lunch', label: '🌤️ Lunch' },
    { key: 'dinner', label: '🌙 Dinner' },
    { key: 'treats', label: '🍬 Treats' },
  ];

  const filteredDeckRecipes = activeFilter
    ? deckRecipes.filter(r => r.category === activeFilter)
    : deckRecipes;

  // Get recipes for a specific day + slot
  const recipesForSlot = (day, slot) => selectedRecipes
    .filter(e => e.day === day && e.slot === slot)
    .map(e => recipes.find(r => r.id === e.id));

  return (
    <div className="app">
      <div className="main">
        <div className="header">
          <h1>Recipe <span>Deck</span></h1>
          <p>Drag cards onto a day to plan your week.</p>
        </div>

        <div className="toolbar">
          <div className="toolbar-group">
            <span className="toolbar-label">People</span>
            <div className="toolbar-pills">
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  className={`toolbar-pill${people === n ? ' active' : ''}`}
                  onClick={() => setPeople(n)}
                >
                  {'👤'.repeat(n)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={customCollision}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className={`selected-area${activeRecipe ? ' drop-target-active' : ''}`}>
            <div className="section-label">
              Meal Plan
              {selectedRecipes.length > 0 && (
                <button className="clear-selected" onClick={() => setSelectedRecipes([])}>Clear all</button>
              )}
            </div>
            <div className="day-grid">
              {/* Slot labels column */}
              <div className="slot-labels">
                <div className="day-header"></div>
                {MEAL_SLOTS.map(slot => (
                  <div key={slot.key} className="slot-label" title={slot.title}>
                    {slot.label}
                  </div>
                ))}
              </div>
              {/* Day columns */}
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div key={day} className="day-column">
                  <div className="day-header">{DAY_LABELS[day - 1]}</div>
                  {MEAL_SLOTS.map(slot => {
                    const slotRecipes = recipesForSlot(day, slot.key);
                    return (
                      <DroppableArea
                        key={slot.key}
                        id={`day-${day}-${slot.key}`}
                        className={`meal-slot${activeRecipe ? (activeRecipe.category === slot.key ? ' slot-match' : ' slot-mismatch') : ''}`}
                      >
                        <SortableContext
                          items={slotRecipes.map(r => r.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {slotRecipes.map(recipe => {
                            const span = getSpan(recipe);
                            return (
                              <div
                                key={recipe.id}
                                className="day-card-wrapper"
                                style={{
                                  width: `calc(${span * 100}% + ${(span - 1) * 12}px)`,
                                }}
                              >
                                <SortableCard
                                  recipe={recipe}
                                  from="selected"
                                  isGhost={activeRecipe && activeRecipe.id === recipe.id && fromRef.current === 'deck'}
                                />
                              </div>
                            );
                          })}
                        </SortableContext>
                      </DroppableArea>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="deck-area">
            <div className="section-label">Recipe Cards</div>
            <div className="filter-pills">
              {categories.map(cat => (
                <button
                  key={cat.key ?? 'all'}
                  className={`filter-pill${activeFilter === cat.key ? ' active' : ''}`}
                  onClick={() => setActiveFilter(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <DroppableArea id="deck-zone" className="deck-container">
              <SortableContext items={filteredDeckRecipes.map(r => r.id)} strategy={horizontalListSortingStrategy}>
                {filteredDeckRecipes.length > 0 ? (
                  filteredDeckRecipes.map((recipe) => (
                    <SortableCard key={recipe.id} recipe={recipe} from="deck" />
                  ))
                ) : (
                  <div className="drop-zone-prompt">
                    {deckRecipes.length === 0 ? 'All cards selected!' : 'No cards in this category'}
                  </div>
                )}
              </SortableContext>
            </DroppableArea>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeRecipe ? <OverlayCard recipe={activeRecipe} /> : null}
          </DragOverlay>
        </DndContext>

        <div className="ingredients-area">
          <div className="section-label">Ingredients</div>
          <div>
            {selectedRecipeData.length > 0 ? (
              selectedRecipeData.map((recipe) => (
                <div key={recipe.id}>
                  <div className="ingredients-recipe-label">{recipe.emoji} {recipe.name}</div>
                  <div className="ingredients-container">
                    {recipe.ingredients.map((ing, i) => (
                      <IngredientCard
                        key={`${recipe.id}-${ing.name}-${ing.qty}`}
                        ingredient={ing}
                        isAdded={isInList(ing)}
                        onClick={() => toggleIngredient(ing)}
                        delay={60 * i}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="arrow-hint">↑</div>
                Select a recipe card to see its ingredients
              </div>
            )}
          </div>
        </div>
      </div>

      <ShoppingList
        items={shoppingList}
        onToggleCheck={toggleCheck}
        onRemove={removeItem}
        onClear={clearList}
        onAddAll={addAllIngredients}
        hasActiveRecipe={selectedRecipes.length > 0}
      />
    </div>
  );
}

export default App;
