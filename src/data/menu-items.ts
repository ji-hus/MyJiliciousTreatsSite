export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  dietaryInfo: {
    vegan?: boolean;
    glutenFree?: boolean;
    nutFree?: boolean;
    dairyFree?: boolean;
  };
  available: boolean;
  stock: number;  // Number of items currently in stock
  madeToOrder: boolean;  // Whether the item is made to order
}

export const menuItems: MenuItem[] = [
  {
    id: "sourdough-bread",
    name: "Classic Sourdough",
    category: "Breads",
    description: "Our signature sourdough bread with a crispy crust and tender, airy crumb. Made with organic flour and our house sourdough starter.",
    price: 9.00,
    dietaryInfo: {
      vegan: true,
      dairyFree: true,
    },
    available: true,
    stock: 5,
    madeToOrder: false
  },
  {
    id: "sandwich-loaf",
    name: "Sandwich Loaf",
    category: "Breads",
    description: "A soft, versatile bread perfect for sandwiches. Made with a blend of white and whole wheat flours for the ideal texture and flavor.",
    price: 8.00,
    dietaryInfo: {
      vegan: true,
      dairyFree: true,
    },
    available: true,
    stock: 3,
    madeToOrder: false
  },
  {
    id: "sourdough-focaccia",
    name: "Sourdough Rosemary Focaccia",
    category: "Breads",
    description: "A soft yet fluffy sourdough focaccia brushed with olive oil and topped with fresh rosemary and sea salt.",
    price: 8.00,
    dietaryInfo: {
      vegan: true,
      dairyFree: true,
    },
    available: true,
    stock: 4,
    madeToOrder: false
  },
  {
    id: "chocolate-chip-cookies",
    name: "Chocolate Chip Cookies",
    category: "Baked Goods",
    description: "Classic chocolate chip cookies made with premium chocolate chunks and a hint of sea salt.",
    price: 3.50,
    dietaryInfo: {},
    available: true,
    stock: 24,
    madeToOrder: false
  },
  {
    id: "blueberry-muffins",
    name: "Blueberry Muffins",
    category: "Baked Goods",
    description: "Tender muffins bursting with fresh blueberries and topped with a crunchy streusel.",
    price: 4.50,
    dietaryInfo: {},
    available: true,
    stock: 12,
    madeToOrder: false
  },
  {
    id: "cinnamon-roll",
    name: "Cinnamon Roll",
    category: "Pastries",
    description: "Soft, swirled cinnamon rolls topped with cream cheese frosting.",
    price: 4.00,
    dietaryInfo: {},
    available: true,
    stock: 8,
    madeToOrder: false
  },
  {
    id: "banana-bread",
    name: "Banana Bread",
    category: "Cakes",
    description: "Moist banana bread made with ripe bananas and a hint of cinnamon.",
    price: 6.00,
    dietaryInfo: {},
    available: true,
    stock: 2,
    madeToOrder: false
  },
  {
    id: "brownies",
    name: "Brownies",
    category: "Baked Goods",
    description: "Spiced carrot cake with cream cheese frosting and chopped walnuts.",
    price: 4.50,
    dietaryInfo: {},
    available: true,
    stock: 16,
    madeToOrder: false
  },
  {
    id: "french-onion-sourdough",
    name: "French Onion Sourdough Loaf",
    category: "Breads",
    description: "Everything you love about a classic French onion soup, but in a loaf of bread.",
    price: 12.00,
    dietaryInfo: {},
    available: true,
    stock: 0,
    madeToOrder: true
  },
  {
    id: "mini-vegan-choc-cake",
    name: "Mini Vegan Chocolate Cake",
    category: "Cakes",
    description: "Rich chocolate cake made without animal products. You won't believe it's vegan!",
    price: 6.50,
    dietaryInfo: {
      vegan: true,
      dairyFree: true,
    },
    available: true,
    stock: 0,
    madeToOrder: true
  },
  {
    id: "vanilla-bean-scones",
    name: "Vanilla Bean Scones",
    category: "Pastries",
    description: "Soft, buttery scones where the vanilla bean is the star.",
    price: 4.00,
    dietaryInfo: {
      nutFree: true
    },
    available: true,
    stock: 6,
    madeToOrder: false
  }
];

export const categories = [...new Set(menuItems.map(item => item.category))];
