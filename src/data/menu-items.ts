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
    name: 'Chocolate Croissant',
    category: 'Pastries',
    description: 'Buttery croissant filled with rich chocolate',
    price: 4.99,
    image: '/images/croissant.jpg',
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
    id: '3',
    name: 'Carrot Cake',
    category: 'Cakes',
    description: 'Moist carrot cake with cream cheese frosting',
    price: 32.99,
    image: '/images/carrot-cake.jpg',
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
    stock: 0,
    madeToOrder: true,
    isSpecial: false
  },
  {
    id: '4',
    name: 'Almond Biscotti',
    category: 'Cookies',
    description: 'Twice-baked Italian cookies with almonds',
    price: 3.99,
    image: '/images/biscotti.jpg',
    dietaryInfo: {
      vegan: true,
      glutenFree: false,
      nutFree: false,
      dairyFree: true
    },
    allergens: {
      wheat: true,
      nuts: true,
      coconut: false,
      milk: false,
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
    stock: 20,
    madeToOrder: false,
    isSpecial: false
  },
  {
    id: '5',
    name: 'Gluten-Free Brownie',
    category: 'Specialty Items',
    description: 'Rich chocolate brownie made with almond flour',
    price: 4.99,
    image: '/images/brownie.jpg',
    dietaryInfo: {
      vegan: false,
      glutenFree: true,
      nutFree: false,
      dairyFree: false
    },
    allergens: {
      wheat: false,
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
    stock: 12,
    madeToOrder: false,
    isSpecial: false
  }
];
