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

// This will be populated from the database
export const menuItems: MenuItem[] = [];
