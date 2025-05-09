import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { menuItems as initialMenuItems, MenuItem, categories } from '@/data/menu-items';
import { database } from '@/services/database';

interface MenuContextType {
  menuItems: MenuItem[];
  dietaryRestrictions: string[];
  categories: string[];
  allergens: string[];
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  addMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  addDietaryRestriction: (restriction: string) => void;
  removeDietaryRestriction: (restriction: string) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addAllergen: (allergen: string) => void;
  removeAllergen: (allergen: string) => void;
  getMenuItem: (id: string) => MenuItem | undefined;
  clearMenuItems: () => void;
  forceRefreshMenuItems: () => void;
}

const MenuContext = createContext<MenuContextType | null>(null);

// Initial dietary restrictions
const initialDietaryRestrictions = ['vegan', 'glutenFree', 'nutFree', 'dairyFree', 'halal', 'kosher'];

// Initial categories
const initialCategories = ['Breads', 'Pastries', 'Baked Goods', 'Specialty Items'];

// Initial allergens
const initialAllergens = [
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

interface DietaryInfo {
  vegan: boolean;
  glutenFree: boolean;
  nutFree: boolean;
  dairyFree: boolean;
  halal: boolean;
  kosher: boolean;
  [key: string]: boolean;
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(initialDietaryRestrictions);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [allergens, setAllergens] = useState<string[]>(initialAllergens);

  // Load menu items from database on mount
  useEffect(() => {
    try {
      const items = database.getAllMenuItems();
      if (items.length === 0) {
        // Initialize with default items if database is empty
        database.initializeWithDefaultItems(initialMenuItems);
        setMenuItems(initialMenuItems);
      } else {
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Error loading menu items from database:', error);
      // Fallback to initial items if database fails
      setMenuItems(initialMenuItems);
    }
  }, []);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    try {
      const updatedItem = database.updateMenuItem(id, updates);
      if (updatedItem) {
        setMenuItems(prevItems => 
          prevItems.map(item => item.id === id ? updatedItem : item)
        );
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  }, []);

  const addMenuItem = useCallback((item: MenuItem) => {
    try {
      const addedItem = database.addMenuItem(item);
      setMenuItems(prevItems => [...prevItems, addedItem]);
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    try {
      database.deleteMenuItem(id);
      setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  }, []);

  const addDietaryRestriction = useCallback((restriction: string) => {
    setDietaryRestrictions(prev => [...prev, restriction]);
  }, []);

  const removeDietaryRestriction = useCallback((restriction: string) => {
    setDietaryRestrictions(prev => prev.filter(r => r !== restriction));
  }, []);

  const addCategory = useCallback((category: string) => {
    setCategories(prev => [...prev, category]);
  }, []);

  const removeCategory = useCallback((category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  }, []);

  const addAllergen = useCallback((allergen: string) => {
    setAllergens(prev => [...prev, allergen]);
  }, []);

  const removeAllergen = useCallback((allergen: string) => {
    setAllergens(prev => prev.filter(a => a !== allergen));
  }, []);

  const getMenuItem = useCallback((id: string) => {
    return menuItems.find(item => item.id === id);
  }, [menuItems]);

  const clearMenuItems = useCallback(() => {
    try {
      database.clearMenuItems();
      database.initializeWithDefaultItems(initialMenuItems);
      setMenuItems(initialMenuItems);
      setDietaryRestrictions(initialDietaryRestrictions);
      setCategories(initialCategories);
      setAllergens(initialAllergens);
    } catch (error) {
      console.error('Error clearing menu items:', error);
    }
  }, []);

  const forceRefreshMenuItems = useCallback(() => {
    clearMenuItems();
    window.location.reload();
  }, [clearMenuItems]);

  const value = useMemo(() => ({
    menuItems,
    dietaryRestrictions,
    categories,
    allergens,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    addDietaryRestriction,
    removeDietaryRestriction,
    addCategory,
    removeCategory,
    addAllergen,
    removeAllergen,
    getMenuItem,
    clearMenuItems,
    forceRefreshMenuItems
  }), [
    menuItems,
    dietaryRestrictions,
    categories,
    allergens,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    addDietaryRestriction,
    removeDietaryRestriction,
    addCategory,
    removeCategory,
    addAllergen,
    removeAllergen,
    getMenuItem,
    clearMenuItems,
    forceRefreshMenuItems
  ]);

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenuItem(id: string) {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenuItem must be used within a MenuProvider');
  return context.getMenuItem(id);
}

export function useFilteredMenuItems(category: string, available: boolean = true) {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useFilteredMenuItems must be used within a MenuProvider');
  return context.menuItems.filter(item => 
    (!category || item.category === category) && 
    (!available || item.active)
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within a MenuProvider');
  return context;
} 