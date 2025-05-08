export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  dietaryInfo: {
    [key: string]: boolean;
  };
  allergens: {
    [key: string]: boolean;
  };
  available: boolean;
  stock: number;  // Number of items currently in stock
  madeToOrder: boolean;  // Whether the item is made to order
  isSpecial: boolean;    // Whether the item is this week's special
}

export const categories = [
  'Breads',
  'Pastries',
  'Cakes',
  'Cookies',
  'Specialty Items'
] as const;

// Initial allergens list
export const initialAllergens = [
  'wheat',
  'nuts',
  'coconut',
  'milk',
  'eggs',
  'soy',
  'sesame',
  'shellfish',
  'fish',
  'peanuts',
  'treeNuts',
  'sulfites'
];

// Initial menu items with updated structure
export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Sourdough Loaf',
    category: 'Breads',
    description: 'Traditional sourdough bread made with organic flour',
    price: 8.99,
    image: '/images/sourdough.jpg',
    dietaryInfo: {
      vegan: true,
      glutenFree: false,
      nutFree: true,
      dairyFree: true
    },
    allergens: {
      wheat: true,
      nuts: false,
      coconut: false,
      milk: false,
      eggs: false,
      soy: false,
      sesame: false,
      shellfish: false,
      fish: false,
      peanuts: false,
      treeNuts: false,
      sulfites: false
    },
    available: true,
    stock: 10,
    madeToOrder: false,
    isSpecial: false
  },
  {
    id: '2',
    name: 'Sandwich Loaf',
    category: 'Breads',
    description: 'Soft and fluffy bread perfect for sandwiches',
    price: 7.99,
    image: '/images/sandwich-loaf.jpg',
    dietaryInfo: {
      vegan: true,
      glutenFree: false,
      nutFree: true,
      dairyFree: true
    },
    allergens: {
      wheat: true,
      nuts: false,
      coconut: false,
      milk: false,
      eggs: false,
      soy: false,
      sesame: false,
      shellfish: false,
      fish: false,
      peanuts: false,
      treeNuts: false,
      sulfites: false
    },
    available: true,
    stock: 8,
    madeToOrder: false,
    isSpecial: false
  },
  {
    id: '3',
    name: 'Sourdough Rosemary Focaccia',
    category: 'Breads',
    description: 'Artisanal focaccia with fresh rosemary and olive oil',
    price: 9.99,
    image: '/images/focaccia.jpg',
    dietaryInfo: {
      vegan: true,
      glutenFree: false,
      nutFree: true,
      dairyFree: true
    },
    allergens: {
      wheat: true,
      nuts: false,
      coconut: false,
      milk: false,
      eggs: false,
      soy: false,
      sesame: false,
      shellfish: false,
      fish: false,
      peanuts: false,
      treeNuts: false,
      sulfites: false
    },
    available: true,
    stock: 6,
    madeToOrder: false,
    isSpecial: false
  },
  {
    id: '4',
    name: 'French Onion Sourdough Loaf',
    category: 'Breads',
    description: 'Sourdough bread infused with caramelized onions and herbs',
    price: 10.99,
    image: '/images/french-onion.jpg',
    dietaryInfo: {
      vegan: true,
      glutenFree: false,
      nutFree: true,
      dairyFree: true
    },
    allergens: {
      wheat: true,
      nuts: false,
      coconut: false,
      milk: false,
      eggs: false,
      soy: false,
      sesame: false,
      shellfish: false,
      fish: false,
      peanuts: false,
      treeNuts: false,
      sulfites: false
    },
    available: true,
    stock: 5,
    madeToOrder: false,
    isSpecial: false
  },
  {
    id: '5',
    name: 'Cinnamon Rolls',
    category: 'Pastries',
    description: 'Soft and fluffy cinnamon rolls with cream cheese frosting',
    price: 4.99,
    image: '/images/cinnamon-rolls.jpg',
    dietaryInfo: {
      vegan: false,
      glutenFree: false,
      nutFree: true,
      dairyFree: false
    },
    allergens: {
      wheat: true,
      nuts: false,
      coconut: false,
      milk: true,
      eggs: true,
      soy: false,
      sesame: false,
      shellfish: false,
      fish: false,
      peanuts: false,
      treeNuts: false,
      sulfites: false
    },
    available: true,
    stock: 12,
    madeToOrder: false,
    isSpecial: false
  },
  {
    id: '6',
    name: 'Vanilla Bean Scones',
    category: 'Pastries',
    description: 'Buttery scones with real vanilla bean and a light glaze',
    price: 3.99,
    image: '/images/scones.jpg',
    dietaryInfo: {
      vegan: false,
      glutenFree: false,
      nutFree: true,
      dairyFree: false
    },
    allergens: {
      wheat: true,
      nuts: false,
      coconut: false,
      milk: true,
      eggs: true,
      soy: false,
      sesame: false,
      shellfish: false,
      fish: false,
      peanuts: false,
      treeNuts: false,
      sulfites: false
    },
    available: true,
    stock: 15,
    madeToOrder: false,
    isSpecial: false
  },
  {
    id: '7',
    name: 'Banana Bread',
    category: 'Pastries',
    description: 'Moist banana bread with walnuts and chocolate chips',
    price: 6.99,
    image: '/images/banana-bread.jpg',
    dietaryInfo: {
      vegan: false,
      glutenFree: false,
      nutFree: false,
      dairyFree: false
    },
    allergens: {
      wheat: true,
      nuts: true,
      coconut: false,
      milk: true,
      eggs: true,
      soy: false,
      sesame: false,
      shellfish: false,
      fish: false,
      peanuts: false,
      treeNuts: true,
      sulfites: false
    },
    available: true,
    stock: 8,
    madeToOrder: false,
    isSpecial: false
  },
  {
    id: '8',
    name: 'Mini Vegan Chocolate Cake',
    category: 'Cakes',
    description: 'Rich chocolate cake made with plant-based ingredients',
    price: 5.99,
    image: '/images/vegan-cake.jpg',
    dietaryInfo: {
      vegan: true,
      glutenFree: false,
      nutFree: true,
      dairyFree: true
    },
    allergens: {
      wheat: true,
      nuts: false,
      coconut: false,
      milk: false,
      eggs: false,
      soy: false,
      sesame: false,
      shellfish: false,
      fish: false,
      peanuts: false,
      treeNuts: false,
      sulfites: false
    },
    available: true,
    stock: 10,
    madeToOrder: false,
    isSpecial: false
  }
];
