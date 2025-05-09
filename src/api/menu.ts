import { database } from '@/services/database';
import { MenuItem } from '@/data/menu-items';

export const menuApi = {
  // Get all menu items
  getAllItems: () => {
    return database.getAllMenuItems();
  },

  // Get a single menu item
  getItem: (id: string) => {
    return database.getMenuItem(id);
  },

  // Add a new menu item
  addItem: (item: MenuItem) => {
    return database.addMenuItem(item);
  },

  // Update a menu item
  updateItem: (id: string, updates: Partial<MenuItem>) => {
    return database.updateMenuItem(id, updates);
  },

  // Delete a menu item
  deleteItem: (id: string) => {
    return database.deleteMenuItem(id);
  },

  // Clear all menu items
  clearItems: () => {
    return database.clearMenuItems();
  },

  // Initialize with default items
  initializeWithDefaults: (items: MenuItem[]) => {
    return database.initializeWithDefaultItems(items);
  }
}; 