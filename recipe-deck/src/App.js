import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext, DragOverlay, useDroppable,
  PointerSensor, TouchSensor, useSensor, useSensors,
  pointerWithin, rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { SortableCard, OverlayCard } from './components/RecipeCard';
import recipesData from './data/recipes';
import staplesData from './data/staples';
import IngredientCard from './components/IngredientCard';
import CreateRecipeModal from './components/CreateRecipeModal';
import CreateStapleModal from './components/CreateStapleModal';
import ShoppingList from './components/ShoppingList';
import './App.css';

function DroppableArea({ id, className, children, innerRef }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const ref = useCallback((node) => {
    setNodeRef(node);
    if (innerRef) innerRef.current = node;
  }, [setNodeRef, innerRef]);
  return (
    <div ref={ref} className={`${className}${isOver ? ' drop-hover' : ''}`}>
      {children}
    </div>
  );
}

// Custom collision detection: prefer droppable zones over sortable items
function customCollision(args) {
  // First try pointerWithin for precision
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    // Prefer droppable zone ids (day-X-Y or deck-zone/staple-deck-zone) over card ids
    const zoneHit = pointerCollisions.find(c =>
      String(c.id).startsWith('day-') || String(c.id) === 'deck-zone' || String(c.id) === 'staple-deck-zone'
    );
    if (zoneHit) return [zoneHit];
    return pointerCollisions;
  }
  // Fallback to rect intersection
  const rectCollisions = rectIntersection(args);
  const zoneHit = rectCollisions.find(c =>
    String(c.id).startsWith('day-') || String(c.id) === 'deck-zone' || String(c.id) === 'staple-deck-zone'
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

function loadState(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
}

function App() {
  const [recipes, setRecipes] = useState(() => loadState('rd-recipes', recipesData));
  const [staples, setStaples] = useState(() => loadState('rd-staples', staplesData));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateStapleModal, setShowCreateStapleModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editingStaple, setEditingStaple] = useState(null);
  const [deletingRecipeId, setDeletingRecipeId] = useState(null);

  // selectedRecipes: [{ id, day, slot }, ...]
  const [selectedRecipes, setSelectedRecipes] = useState(() => loadState('rd-selected', []));
  const [shoppingList, setShoppingList] = useState(() => loadState('rd-shopping', []));
  const [activeRecipe, setActiveRecipe] = useState(null);
  const fromRef = useRef(null);
  const snapshotRef = useRef([]);
  const deckScrollRef = useRef(null);

  const [people, setPeople] = useState(() => loadState('rd-people', 1));

  // Persist state to localStorage
  useEffect(() => { localStorage.setItem('rd-recipes', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('rd-staples', JSON.stringify(staples)); }, [staples]);
  useEffect(() => { localStorage.setItem('rd-selected', JSON.stringify(selectedRecipes)); }, [selectedRecipes]);
  useEffect(() => { localStorage.setItem('rd-shopping', JSON.stringify(shoppingList)); }, [shoppingList]);
  useEffect(() => { localStorage.setItem('rd-people', JSON.stringify(people)); }, [people]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [recipesCollapsed, setRecipesCollapsed] = useState(false);
  const [staplesCollapsed, setStaplesCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } })
  );

  // Combined lookup: find item in recipes or staples
  const findItem = useCallback((id) => {
    return recipes.find(r => r.id === id) || staples.find(s => s.id === id);
  }, [recipes, staples]);

  const isInList = useCallback((ing) => {
    return shoppingList.some(s => s.name === ing.name && s.qty === ing.qty);
  }, [shoppingList]);

  const getSpan = (recipe) => {
    if (recipe.category === 'treats' || recipe.category === 'pantry') return 1;
    return Math.ceil(recipe.servings / people);
  };

  // Check if a recipe is allowed in a given slot
  const recipeMatchesSlot = (recipeId, slot) => {
    const item = findItem(recipeId);
    return item && item.category === slot;
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
    const isDeckZone = overIdStr === 'deck-zone' || overIdStr === 'staple-deck-zone';

    if (from === 'deck' || from === 'staple-deck') {
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
      const isDeckZone = overIdStr === 'deck-zone' || overIdStr === 'staple-deck-zone';

      if (from === 'selected' && isDeckZone) {
        // If removing a staple from the plan, remove it from shopping list
        const item = findItem(id);
        if (item && item.category === 'pantry') {
          setShoppingList(prev => prev.filter(s => !(s.name === item.name && s.qty === item.qty)));
        }
        setSelectedRecipes(prev => prev.filter(e => e.id !== id));
      } else if (from === 'selected' && parsed && recipeMatchesSlot(id, parsed.slot)) {
        setSelectedRecipes(prev => prev.map(e => e.id === id ? { ...e, day: parsed.day, slot: parsed.slot } : e));
      } else if ((from === 'deck' || from === 'staple-deck') && parsed && recipeMatchesSlot(id, parsed.slot)) {
        // If placing a staple on the plan, add it to shopping list
        const item = findItem(id);
        if (item && item.category === 'pantry') {
          setShoppingList(prev => {
            if (prev.some(s => s.name === item.name && s.qty === item.qty)) return prev;
            return [...prev, { name: item.name, qty: item.qty }];
          });
        }
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
    const allIngs = selectedRecipes.flatMap(entry => {
      const item = findItem(entry.id);
      if (item.category === 'pantry') return [];
      return item.ingredients;
    });
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

  const handleDeleteRecipe = (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setStaples(prev => prev.filter(s => s.id !== id));
    setSelectedRecipes(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateRecipe = (updatedRecipe) => {
    setRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? { ...r, ...updatedRecipe } : r));
    setEditingRecipe(null);
  };

  const handleUpdateStaple = (updatedStaple) => {
    setStaples(prev => prev.map(s => s.id === updatedStaple.id ? { ...s, ...updatedStaple } : s));
    setEditingStaple(null);
  };

  // Build selected data from both recipes and staples
  const selectedRecipeData = selectedRecipes.map(entry => {
    const item = findItem(entry.id);
    return item ? { ...item, day: entry.day, slot: entry.slot } : null;
  }).filter(Boolean);

  const selectedIds = selectedRecipes.map(e => e.id);
  const deckRecipes = recipes.filter(r => !selectedIds.includes(r.id));
  const deckStaples = staples.filter(s => !selectedIds.includes(s.id));

  const categories = [
    { key: null, label: 'All' },
    { key: 'breakfast', label: '☀️ Breakfast' },
    { key: 'lunch', label: '🌤️ Lunch' },
    { key: 'dinner', label: '🌙 dinner' },
    { key: 'treats', label: '🍬 Treats' },
  ];

  const filteredDeckRecipes = activeFilter
    ? deckRecipes.filter(r => r.category === activeFilter)
    : deckRecipes;

  // Get recipes for a specific day + slot
  const recipesForSlot = (day, slot) => selectedRecipes
    .filter(e => e.day === day && e.slot === slot)
    .map(e => findItem(e.id))
    .filter(Boolean);

  // All pantry items on the plan (day=0)
  const pantryOnPlan = selectedRecipes
    .filter(e => e.slot === 'pantry')
    .map(e => findItem(e.id))
    .filter(Boolean);

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
                                  isGhost={activeRecipe && activeRecipe.id === recipe.id && (fromRef.current === 'deck' || fromRef.current === 'staple-deck')}
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
            {/* Pantry row — inside grid, spanning all day columns */}
            <div className="pantry-row-label slot-label" title="Pantry">🛒</div>
            <DroppableArea
              id="day-0-pantry"
              className={`meal-slot pantry-slot${activeRecipe ? (activeRecipe.category === 'pantry' ? ' slot-match' : ' slot-mismatch') : ''}`}
            >
              <SortableContext
                items={pantryOnPlan.map(r => r.id)}
                strategy={horizontalListSortingStrategy}
              >
                {pantryOnPlan.map(item => (
                  <div key={item.id} className="day-card-wrapper">
                    <SortableCard
                      recipe={item}
                      from="selected"
                      isGhost={activeRecipe && activeRecipe.id === item.id && fromRef.current === 'staple-deck'}
                    />
                  </div>
                ))}
              </SortableContext>
            </DroppableArea>
          </div>

          <div className="deck-area">
            <div className="section-label">
              <button className="collapse-toggle" onClick={() => setRecipesCollapsed(c => !c)}>{recipesCollapsed ? '▸' : '▾'}</button>
              Recipe Cards
              <button className="btn-add-recipe" onClick={() => setShowCreateModal(true)}>+ Add Recipe</button>
            </div>
            {!recipesCollapsed && (
              <>
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
                <div className="deck-scroll-wrapper">
                  <button className="deck-arrow deck-arrow-left" onClick={() => deckScrollRef.current?.scrollBy({ left: -432, behavior: 'smooth' })}>‹</button>
                  <DroppableArea id="deck-zone" className="deck-container" innerRef={deckScrollRef}>
                    <SortableContext items={filteredDeckRecipes.map(r => r.id)} strategy={horizontalListSortingStrategy}>
                      {filteredDeckRecipes.length > 0 ? (
                        filteredDeckRecipes.map((recipe) => (
                          <SortableCard key={recipe.id} recipe={recipe} from="deck" onEdit={setEditingRecipe} onDelete={setDeletingRecipeId} />
                        ))
                      ) : (
                        <div className="drop-zone-prompt">
                          {deckRecipes.length === 0 ? 'All cards selected!' : 'No cards in this category'}
                        </div>
                      )}
                    </SortableContext>
                  </DroppableArea>
                  <button className="deck-arrow deck-arrow-right" onClick={() => deckScrollRef.current?.scrollBy({ left: 432, behavior: 'smooth' })}>›</button>
                </div>
              </>
            )}
          </div>

          <div className="deck-area staple-deck-area">
            <div className="section-label">
              <button className="collapse-toggle" onClick={() => setStaplesCollapsed(c => !c)}>{staplesCollapsed ? '▸' : '▾'}</button>
              Pantry Staples
              <button className="btn-add-recipe" onClick={() => setShowCreateStapleModal(true)}>+ Add Staple</button>
            </div>
            {!staplesCollapsed && (
              <DroppableArea id="staple-deck-zone" className="staple-grid">
                <SortableContext items={deckStaples.map(s => s.id)} strategy={horizontalListSortingStrategy}>
                  {deckStaples.length > 0 ? (
                    deckStaples.map((staple) => (
                      <SortableCard
                        key={staple.id}
                        recipe={staple}
                        from="staple-deck"
                        onEdit={(item) => setEditingStaple(item)}
                        onDelete={setDeletingRecipeId}
                      />
                    ))
                  ) : (
                    <div className="drop-zone-prompt">All staples on the plan!</div>
                  )}
                </SortableContext>
              </DroppableArea>
            )}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeRecipe ? <OverlayCard recipe={activeRecipe} /> : null}
          </DragOverlay>
        </DndContext>

        <div className="ingredients-area">
          <div className="section-label">Ingredients</div>
          <div>
            {selectedRecipeData.some(item => item.category !== 'pantry') ? (
              selectedRecipeData.filter(item => item.category !== 'pantry').map((item) => (
                <div key={item.id}>
                  <div className="ingredients-recipe-label">{item.emoji} {item.name}</div>
                  <div className="ingredients-container">
                    {item.ingredients.map((ing, i) => (
                      <IngredientCard
                        key={`${item.id}-${ing.name}-${ing.qty}`}
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

      {showCreateModal && (
        <CreateRecipeModal
          onClose={() => setShowCreateModal(false)}
          onSave={(newRecipe) => {
            setRecipes(prev => [...prev, newRecipe]);
            setShowCreateModal(false);
          }}
        />
      )}

      {editingRecipe && (
        <CreateRecipeModal
          recipe={editingRecipe}
          onClose={() => setEditingRecipe(null)}
          onSave={handleUpdateRecipe}
        />
      )}

      {showCreateStapleModal && (
        <CreateStapleModal
          onClose={() => setShowCreateStapleModal(false)}
          onSave={(newStaple) => {
            setStaples(prev => [...prev, newStaple]);
            setShowCreateStapleModal(false);
          }}
        />
      )}

      {editingStaple && (
        <CreateStapleModal
          staple={editingStaple}
          onClose={() => setEditingStaple(null)}
          onSave={handleUpdateStaple}
        />
      )}

      {deletingRecipeId && (
        <div className="modal-backdrop" onClick={() => setDeletingRecipeId(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete</h2>
              <button className="modal-close" onClick={() => setDeletingRecipeId(null)}>×</button>
            </div>
            <p className="confirm-text">Are you sure you want to delete <strong>{findItem(deletingRecipeId)?.name}</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setDeletingRecipeId(null)}>Cancel</button>
              <button className="btn-modal-delete" onClick={() => { handleDeleteRecipe(deletingRecipeId); setDeletingRecipeId(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(o => !o)}>
        🛒 {shoppingList.length > 0 && <span className="sidebar-badge">{shoppingList.length}</span>}
      </button>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <ShoppingList
        items={shoppingList}
        onToggleCheck={toggleCheck}
        onRemove={removeItem}
        onClear={clearList}
        onAddAll={addAllIngredients}
        hasActiveRecipe={selectedRecipes.length > 0}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}

export default App;
