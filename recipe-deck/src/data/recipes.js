const recipes = [
  {
    id: 4, emoji: '🥞', name: 'Fluffy Pancakes', desc: 'Golden buttermilk pancakes with maple syrup', time: '25 min', servings: 4, category: 'breakfast',
    ingredients: [
      { name: 'All-Purpose Flour', qty: '200g' },
      { name: 'Buttermilk', qty: '300ml' },
      { name: 'Eggs', qty: '2 large' },
      { name: 'Butter', qty: '30g' },
      { name: 'Baking Powder', qty: '2 tsp' },
      { name: 'Sugar', qty: '2 tbsp' },
      { name: 'Maple Syrup', qty: '120ml' },
    ]
  },
  {
    id: 3, emoji: '🥗', name: 'Caesar Salad', desc: 'Crisp romaine, garlicky croutons, tangy dressing', time: '15 min', servings: 2, category: 'lunch',
    ingredients: [
      { name: 'Romaine Lettuce', qty: '2 heads' },
      { name: 'Parmesan', qty: '60g' },
      { name: 'Bread', qty: '2 slices' },
      { name: 'Anchovy Fillets', qty: '4 pcs' },
      { name: 'Egg Yolk', qty: '1 large' },
      { name: 'Lemon', qty: '1 whole' },
      { name: 'Garlic', qty: '2 cloves' },
      { name: 'Olive Oil', qty: '4 tbsp' },
    ]
  },
  {
    id: 6, emoji: '🍲', name: 'Tomato Soup', desc: 'Velvety roasted tomato soup with fresh basil', time: '40 min', servings: 4, category: 'lunch',
    ingredients: [
      { name: 'Tomatoes', qty: '1 kg' },
      { name: 'Onion', qty: '1 large' },
      { name: 'Garlic', qty: '4 cloves' },
      { name: 'Vegetable Broth', qty: '500ml' },
      { name: 'Heavy Cream', qty: '100ml' },
      { name: 'Fresh Basil', qty: '1 bunch' },
      { name: 'Olive Oil', qty: '3 tbsp' },
    ]
  },
  {
    id: 7, emoji: '🧀', name: 'Grilled Cheese', desc: 'Buttery, golden-crusted with melty cheese layers', time: '10 min', servings: 2, category: 'lunch',
    ingredients: [
      { name: 'Sourdough Bread', qty: '4 slices' },
      { name: 'Cheddar Cheese', qty: '120g' },
      { name: 'Gruyère Cheese', qty: '80g' },
      { name: 'Butter', qty: '40g' },
      { name: 'Dijon Mustard', qty: '1 tsp' },
    ]
  },
  {
    id: 1, emoji: '🍝', name: 'Spaghetti Bolognese', desc: 'Rich, slow-simmered meat sauce on al dente pasta', time: '45 min', servings: 4, category: 'dinner',
    ingredients: [
      { name: 'Spaghetti', qty: '400g' },
      { name: 'Ground Beef', qty: '500g' },
      { name: 'Onion', qty: '1 large' },
      { name: 'Garlic', qty: '3 cloves' },
      { name: 'Crushed Tomatoes', qty: '400g' },
      { name: 'Tomato Paste', qty: '2 tbsp' },
      { name: 'Parmesan', qty: '50g' },
      { name: 'Olive Oil', qty: '2 tbsp' },
    ]
  },
  {
    id: 2, emoji: '🥘', name: 'Chicken Stir Fry', desc: 'Quick wok-tossed chicken with crisp vegetables', time: '20 min', servings: 3, category: 'dinner',
    ingredients: [
      { name: 'Chicken Breast', qty: '500g' },
      { name: 'Bell Pepper', qty: '2 whole' },
      { name: 'Broccoli', qty: '1 head' },
      { name: 'Soy Sauce', qty: '3 tbsp' },
      { name: 'Ginger', qty: '1 inch' },
      { name: 'Garlic', qty: '2 cloves' },
      { name: 'Sesame Oil', qty: '1 tbsp' },
      { name: 'Rice', qty: '300g' },
    ]
  },
  {
    id: 5, emoji: '🌮', name: 'Beef Tacos', desc: 'Spiced ground beef with fresh toppings in corn shells', time: '30 min', servings: 4, category: 'dinner',
    ingredients: [
      { name: 'Ground Beef', qty: '500g' },
      { name: 'Taco Shells', qty: '8 pcs' },
      { name: 'Onion', qty: '1 medium' },
      { name: 'Tomato', qty: '2 whole' },
      { name: 'Lettuce', qty: '1/2 head' },
      { name: 'Cheddar Cheese', qty: '100g' },
      { name: 'Sour Cream', qty: '120ml' },
      { name: 'Cumin', qty: '1 tbsp' },
      { name: 'Lime', qty: '2 whole' },
    ]
  },
  {
    id: 8, emoji: '🥩', name: 'Beef Stew', desc: 'Hearty chunks of beef braised with root vegetables', time: '2 hrs', servings: 6, category: 'dinner',
    ingredients: [
      { name: 'Beef Chuck', qty: '800g' },
      { name: 'Potatoes', qty: '4 medium' },
      { name: 'Carrots', qty: '3 large' },
      { name: 'Onion', qty: '2 medium' },
      { name: 'Beef Broth', qty: '750ml' },
      { name: 'Tomato Paste', qty: '2 tbsp' },
      { name: 'Flour', qty: '3 tbsp' },
      { name: 'Thyme', qty: '3 sprigs' },
      { name: 'Red Wine', qty: '200ml' },
    ]
  },
  {
    id: 9, emoji: '🍪', name: 'Chocolate Chip Cookies', desc: 'Chewy, golden-edged cookies loaded with chocolate', time: '30 min', servings: 24, category: 'treats',
    ingredients: [
      { name: 'All-Purpose Flour', qty: '280g' },
      { name: 'Butter', qty: '230g' },
      { name: 'Brown Sugar', qty: '200g' },
      { name: 'Sugar', qty: '100g' },
      { name: 'Eggs', qty: '2 large' },
      { name: 'Vanilla Extract', qty: '2 tsp' },
      { name: 'Chocolate Chips', qty: '340g' },
      { name: 'Baking Soda', qty: '1 tsp' },
      { name: 'Salt', qty: '1 tsp' },
    ]
  },
  {
    id: 10, emoji: '🍿', name: 'Caramel Popcorn', desc: 'Sweet, crunchy caramel-coated popcorn clusters', time: '20 min', servings: 8, category: 'treats',
    ingredients: [
      { name: 'Popcorn Kernels', qty: '100g' },
      { name: 'Brown Sugar', qty: '200g' },
      { name: 'Butter', qty: '115g' },
      { name: 'Corn Syrup', qty: '80ml' },
      { name: 'Baking Soda', qty: '1/2 tsp' },
      { name: 'Salt', qty: '1/2 tsp' },
    ]
  },
];

export default recipes;
