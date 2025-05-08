export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  dietaryInfo: {
    vegan: boolean;
    glutenFree: boolean;
    nutFree: boolean;
    dairyFree: boolean;
    halal: boolean;
    kosher: boolean;
  };
  allergens: {
    [key: string]: boolean;
  };
  available: boolean;
  stock: number;
  madeToOrder: boolean;
  isSpecial: boolean;
  preparationTime?: number;  // in minutes
  bestSeller: boolean;
  seasonal: boolean;
  seasonStart?: string;
  seasonEnd?: string;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  active: boolean;
}

export const categories = [
  'Breads',
  'Pastries',
  'Baked Goods',
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

// Initial dietary restrictions
export const initialDietaryRestrictions = [
  'vegan',
  'glutenFree',
  'nutFree',
  'dairyFree',
  'halal',
  'kosher'
] as const;

// Default dietary info for new items
export const defaultDietaryInfo = {
  vegan: false,
  glutenFree: false,
  nutFree: false,
  dairyFree: false,
  halal: false,
  kosher: false
};

// This will be populated from the database
export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Croissant',
    category: 'Pastries',
    description: 'Buttery, flaky, and perfectly golden. Our signature croissant is made fresh daily.',
    price: 3.99,
    image: '',
    dietaryInfo: {
      vegan: false,
      glutenFree: false,
      nutFree: true,
      dairyFree: false,
      halal: true,
      kosher: false
    },
    allergens: {
      wheat: true,
      milk: true,
      eggs: true
    },
    available: true,
    stock: 20,
    madeToOrder: false,
    isSpecial: false,
    bestSeller: true,
    seasonal: false,
    active: true
  },
  {
    id: '2',
    name: 'Sourdough Bread',
    category: 'Breads',
    description: 'Traditional sourdough bread made with our 100-year-old starter. Perfect for sandwiches or toast.',
    price: 6.99,
    image: '',
    dietaryInfo: {
      vegan: true,
      glutenFree: false,
      nutFree: true,
      dairyFree: true,
      halal: true,
      kosher: true
    },
    allergens: {
      wheat: true
    },
    available: true,
    stock: 10,
    madeToOrder: false,
    isSpecial: false,
    bestSeller: true,
    seasonal: false,
    active: true
  },
  {
    id: '3',
    name: 'Chocolate Chip Cookie',
    category: 'Baked Goods',
    description: 'Our famous chocolate chip cookie, made with premium chocolate and real butter.',
    price: 2.99,
    image: '',
    dietaryInfo: {
      vegan: false,
      glutenFree: false,
      nutFree: true,
      dairyFree: false,
      halal: true,
      kosher: false
    },
    allergens: {
      wheat: true,
      milk: true,
      eggs: true
    },
    available: true,
    stock: 30,
    madeToOrder: false,
    isSpecial: false,
    bestSeller: true,
    seasonal: false,
    active: true
  },
  {
    id: '4',
    name: 'Custom Birthday Cake',
    category: 'Specialty Items',
    description: 'Custom-made birthday cake with your choice of flavors and decorations. Order 48 hours in advance.',
    price: 45.99,
    image: '',
    dietaryInfo: {
      vegan: false,
      glutenFree: false,
      nutFree: false,
      dairyFree: false,
      halal: true,
      kosher: false
    },
    allergens: {
      wheat: true,
      milk: true,
      eggs: true,
      nuts: true
    },
    available: true,
    stock: 0,
    madeToOrder: true,
    isSpecial: true,
    bestSeller: false,
    seasonal: false,
    active: true
  }
];

// Helper function to create a new menu item with proper initialization
export function createMenuItem(partialItem: Partial<MenuItem>): MenuItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    category: categories[0],
    description: '',
    price: 0,
    image: '',
    dietaryInfo: {
      ...defaultDietaryInfo,
      ...(partialItem.dietaryInfo || {})
    },
    allergens: {},
    available: true,
    stock: 0,
    madeToOrder: false,
    isSpecial: false,
    bestSeller: false,
    seasonal: false,
    active: true,
    ...partialItem
  };
}
