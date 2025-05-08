export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  madeToOrder: boolean;
  available: boolean;
  active: boolean;
  dietaryInfo: { [key: string]: boolean };
  allergens: { [key: string]: boolean };
  isSpecial: boolean;
  bestSeller: boolean;
  seasonal: boolean;
  image?: string;
} 