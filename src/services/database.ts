import Database from 'better-sqlite3';
import { MenuItem } from '@/data/menu-items';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'menu.db');
const db = new Database(dbPath);

// Initialize the database with tables
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      stock INTEGER NOT NULL,
      madeToOrder BOOLEAN NOT NULL,
      available BOOLEAN NOT NULL,
      active BOOLEAN NOT NULL,
      isSpecial BOOLEAN NOT NULL,
      bestSeller BOOLEAN NOT NULL,
      seasonal BOOLEAN NOT NULL,
      image TEXT,
      dietaryInfo TEXT NOT NULL,
      allergens TEXT NOT NULL
    )
  `);
}

// Initialize the database when the service is imported
initializeDatabase();

// Helper function to convert MenuItem to database format
function menuItemToDb(item: MenuItem) {
  return {
    ...item,
    dietaryInfo: JSON.stringify(item.dietaryInfo),
    allergens: JSON.stringify(item.allergens)
  };
}

// Helper function to convert database row to MenuItem
function dbToMenuItem(row: any): MenuItem {
  return {
    ...row,
    dietaryInfo: JSON.parse(row.dietaryInfo),
    allergens: JSON.parse(row.allergens)
  };
}

export const database = {
  // Get all menu items
  getAllMenuItems: () => {
    const rows = db.prepare('SELECT * FROM menu_items').all();
    return rows.map(dbToMenuItem);
  },

  // Get a single menu item by ID
  getMenuItem: (id: string) => {
    const row = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    return row ? dbToMenuItem(row) : null;
  },

  // Add a new menu item
  addMenuItem: (item: MenuItem) => {
    const dbItem = menuItemToDb(item);
    db.prepare(`
      INSERT INTO menu_items (
        id, name, description, price, category, stock, madeToOrder,
        available, active, isSpecial, bestSeller, seasonal, image,
        dietaryInfo, allergens
      ) VALUES (
        @id, @name, @description, @price, @category, @stock, @madeToOrder,
        @available, @active, @isSpecial, @bestSeller, @seasonal, @image,
        @dietaryInfo, @allergens
      )
    `).run(dbItem);
    return item;
  },

  // Update a menu item
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => {
    const currentItem = database.getMenuItem(id);
    if (!currentItem) return null;

    const updatedItem = { ...currentItem, ...updates };
    const dbItem = menuItemToDb(updatedItem);
    
    db.prepare(`
      UPDATE menu_items SET
        name = @name,
        description = @description,
        price = @price,
        category = @category,
        stock = @stock,
        madeToOrder = @madeToOrder,
        available = @available,
        active = @active,
        isSpecial = @isSpecial,
        bestSeller = @bestSeller,
        seasonal = @seasonal,
        image = @image,
        dietaryInfo = @dietaryInfo,
        allergens = @allergens
      WHERE id = @id
    `).run(dbItem);

    return updatedItem;
  },

  // Delete a menu item
  deleteMenuItem: (id: string) => {
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
  },

  // Clear all menu items
  clearMenuItems: () => {
    db.prepare('DELETE FROM menu_items').run();
  },

  // Initialize with default menu items
  initializeWithDefaultItems: (items: MenuItem[]) => {
    db.prepare('DELETE FROM menu_items').run();
    items.forEach(item => database.addMenuItem(item));
  }
}; 