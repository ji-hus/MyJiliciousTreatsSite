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
export const menuItems: MenuItem[] = [];

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
