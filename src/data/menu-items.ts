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
  // New fields for better management
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  version: number;
  sku?: string;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  batchSize?: number;
  storageInstructions?: string;
  shelfLife?: number; // in days
  ingredients?: string[];
  allergensList?: string[];
  crossContamination?: string[];
  customizations?: {
    name: string;
    options: string[];
    priceAdjustment?: number;
  }[];
  tags?: string[];
  notes?: string;
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

// This is your source of truth for menu items
export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Classic Sourdough",
    category: "Breads",
    description: "Traditional sourdough bread made with our 100-year-old starter",
    price: 8.99,
    image: "/images/sourdough.jpg",
    dietaryInfo: {
      vegan: true,
      glutenFree: false,
      nutFree: true,
      dairyFree: true,
      halal: true,
      kosher: true
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
    isSpecial: false,
    bestSeller: true,
    seasonal: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    sku: "BRD-001",
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 10,
    batchSize: 12,
    storageInstructions: "Store in a cool, dry place. Best consumed within 5 days.",
    shelfLife: 5,
    ingredients: ["organic flour", "water", "salt", "sourdough starter"],
    allergensList: ["wheat"],
    crossContamination: ["gluten"],
    customizations: [
      {
        name: "Size",
        options: ["Small", "Medium", "Large"],
        priceAdjustment: 2
      }
    ],
    tags: ["traditional", "artisan", "sourdough"],
    notes: "Our signature bread, made fresh daily"
  }
  // Add more menu items here...
];

// Helper function to create a new menu item with proper initialization
export function createMenuItem(partialItem: Partial<MenuItem>): MenuItem {
  const now = new Date().toISOString();
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
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...partialItem
  };
}

// Validation function for menu items
export function validateMenuItem(item: MenuItem): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item.name) errors.push('Name is required');
  if (!item.category) errors.push('Category is required');
  if (item.price < 0) errors.push('Price must be non-negative');
  if (item.stock < 0) errors.push('Stock must be non-negative');
  if (item.seasonal && (!item.seasonStart || !item.seasonEnd)) {
    errors.push('Seasonal items must have start and end dates');
  }
  if (item.minimumOrderQuantity && item.maximumOrderQuantity && 
      item.minimumOrderQuantity > item.maximumOrderQuantity) {
    errors.push('Minimum order quantity cannot be greater than maximum order quantity');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to update a menu item with proper versioning
export function updateMenuItem(oldItem: MenuItem, updates: Partial<MenuItem>): MenuItem {
  const now = new Date().toISOString();
  return {
    ...oldItem,
    ...updates,
    updatedAt: now,
    version: oldItem.version + 1
  };
}
