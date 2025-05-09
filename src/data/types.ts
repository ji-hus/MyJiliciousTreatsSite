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
    [key: string]: boolean;
  };
  allergens: {
    wheat: boolean;
    nuts: boolean;
    coconut: boolean;
    milk: boolean;
    eggs: boolean;
    soy: boolean;
    sesame: boolean;
    shellfish: boolean;
    fish: boolean;
    peanuts: boolean;
    treeNuts: boolean;
    sulfites: boolean;
    [key: string]: boolean;
  };
  available: boolean;
  stock: number;
  madeToOrder: boolean;
  isSpecial: boolean;
  bestSeller: boolean;
  seasonal: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  sku?: string;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  batchSize?: number;
  storageInstructions?: string;
  shelfLife?: number;
  ingredients?: string[];
  allergensList?: string[];
  crossContamination?: string[];
  customizations?: Array<{
    name: string;
    options: string[];
    priceAdjustment: number;
  }>;
  tags?: string[];
  notes?: string;
} 