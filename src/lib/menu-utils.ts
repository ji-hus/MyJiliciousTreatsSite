import { MenuItem } from '@/data/types';
import { initialAllergens } from '@/data/initial-data';

export function createMenuItem(data: Partial<MenuItem>): MenuItem {
  const now = new Date().toISOString();
  const allergens = Object.fromEntries(
    initialAllergens.map(allergen => [allergen, false])
  );

  return {
    id: crypto.randomUUID(),
    name: data.name || '',
    description: data.description || '',
    price: data.price || 0,
    category: data.category || '',
    stock: data.stock || 0,
    madeToOrder: data.madeToOrder || false,
    available: data.available ?? true,
    active: data.active ?? true,
    dietaryInfo: {
      vegan: false,
      glutenFree: false,
      nutFree: false,
      dairyFree: false,
      halal: false,
      kosher: false,
      ...data.dietaryInfo
    },
    allergens: {
      ...allergens,
      ...data.allergens
    },
    isSpecial: data.isSpecial || false,
    bestSeller: data.bestSeller || false,
    seasonal: data.seasonal || false,
    image: data.image || '',
    sku: data.sku,
    minimumOrderQuantity: data.minimumOrderQuantity,
    maximumOrderQuantity: data.maximumOrderQuantity,
    batchSize: data.batchSize,
    storageInstructions: data.storageInstructions,
    shelfLife: data.shelfLife,
    ingredients: data.ingredients,
    allergensList: data.allergensList,
    crossContamination: data.crossContamination,
    customizations: data.customizations,
    tags: data.tags,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
    version: 1
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