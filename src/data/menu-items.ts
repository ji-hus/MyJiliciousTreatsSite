// This file is auto-generated. Do not edit manually.
import { MenuItem } from './types';

export const initialDietaryRestrictions = [
  'vegan',
  'glutenFree',
  'nutFree',
  'dairyFree',
  'halal',
  'kosher'
];

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

export const categories = [
  'Breads',
  'Pastries',
  'Cookies',
  'Cakes',
  'Special Items'
];

export const menuItems: MenuItem[] = [
  {
    "id": "1",
    "name": "Classic Sourdough",
    "category": "Breads",
    "description": "Traditional sourdough bread made with our 100-year-old starter",
    "price": 8.99,
    "image": "/images/sourdough.jpg",
    "dietaryInfo": {
      "vegan": true,
      "glutenFree": false,
      "nutFree": true,
      "dairyFree": true,
      "halal": true,
      "kosher": true
    },
    "allergens": {
      "wheat": true,
      "nuts": false,
      "coconut": false,
      "milk": false,
      "eggs": false,
      "soy": false,
      "sesame": false,
      "shellfish": false,
      "fish": false,
      "peanuts": false,
      "treeNuts": false,
      "sulfites": false
    },
    "available": true,
    "stock": 10,
    "madeToOrder": false,
    "isSpecial": false,
    "bestSeller": true,
    "seasonal": false,
    "active": true,
    "createdAt": "2025-05-09T01:29:37.422Z",
    "updatedAt": "2025-05-09T01:29:37.422Z",
    "version": 1,
    "sku": "BRD-001",
    "minimumOrderQuantity": 1,
    "maximumOrderQuantity": 10,
    "batchSize": 12,
    "storageInstructions": "Store in a cool, dry place. Best consumed within 5 days.",
    "shelfLife": 5,
    "ingredients": [
      "organic flour",
      "water",
      "salt",
      "sourdough starter"
    ],
    "allergensList": [
      "wheat"
    ],
    "crossContamination": [
      "gluten"
    ],
    "customizations": [
      {
        "name": "Size",
        "options": [
          "Small",
          "Medium",
          "Large"
        ],
        "priceAdjustment": 2
      }
    ],
    "tags": [
      "traditional",
      "artisan",
      "sourdough"
    ],
    "notes": "Our signature bread, made fresh daily"
  },
  {
    "id": "057038e8-2c17-4a94-9a6a-572e2c523f17",
    "name": "Test GitHub Item",
    "category": "Breads",
    "description": "Testing GitHub Integration",
    "price": 9.99,
    "image": "",
    "dietaryInfo": {
      "vegan": false,
      "glutenFree": false,
      "nutFree": false,
      "dairyFree": false,
      "halal": false,
      "kosher": false
    },
    "allergens": {
      "wheat": false,
      "nuts": false,
      "coconut": false,
      "milk": false,
      "eggs": false,
      "soy": false,
      "sesame": false,
      "shellfish": false,
      "fish": false,
      "peanuts": false,
      "treeNuts": false,
      "sulfites": false
    },
    "available": true,
    "stock": 10,
    "madeToOrder": false,
    "isSpecial": false,
    "bestSeller": false,
    "seasonal": false,
    "active": true,
    "createdAt": "2025-05-09T01:32:19.832Z",
    "updatedAt": "2025-05-09T01:32:19.832Z",
    "version": 1
  }
];

export function createMenuItem(item: Partial<MenuItem>): MenuItem {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: '',
    category: '',
    description: '',
    price: 0,
    image: '',
    dietaryInfo: {
      vegan: false,
      glutenFree: false,
      nutFree: false,
      dairyFree: false,
      halal: false,
      kosher: false
    },
    allergens: {
      wheat: false,
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
    stock: 0,
    madeToOrder: false,
    isSpecial: false,
    bestSeller: false,
    seasonal: false,
    active: true,
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...item
  };
}

export function validateMenuItem(item: MenuItem): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item.name) errors.push('Name is required');
  if (!item.category) errors.push('Category is required');
  if (!item.description) errors.push('Description is required');
  if (item.price < 0) errors.push('Price must be non-negative');
  if (item.stock < 0) errors.push('Stock must be non-negative');

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function updateMenuItem(item: MenuItem, updates: Partial<MenuItem>): MenuItem {
  return {
    ...item,
    ...updates,
    updatedAt: new Date().toISOString(),
    version: item.version + 1
  };
}
