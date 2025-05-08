import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { menuItems as initialMenuItems, MenuItem } from '@/data/menu-items';

interface MenuContextType {
  menuItems: MenuItem[];
  dietaryRestrictions: string[];
  categories: string[];
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  addMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  addDietaryRestriction: (restriction: string) => void;
  removeDietaryRestriction: (restriction: string) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const STORAGE_KEY = 'menu-items';
const DIETARY_STORAGE_KEY = 'dietary-restrictions';
const CATEGORIES_STORAGE_KEY = 'menu-categories';

// Initial dietary restrictions
const initialDietaryRestrictions = ['vegan', 'glutenFree', 'nutFree', 'dairyFree'];

// Initial categories
const initialCategories = ['Breads', 'Pastries', 'Cakes', 'Cookies', 'Specialty Items'];

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Loading menu items from storage:', stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Parsed menu items:', parsed);
        return parsed;
      } catch (e) {
        console.error('Failed to parse stored menu items:', e);
      }
    }
    console.log('Using initial menu items');
    return initialMenuItems;
  });

  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(() => {
    const stored = localStorage.getItem(DIETARY_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored dietary restrictions:', e);
      }
    }
    return initialDietaryRestrictions;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored categories:', e);
      }
    }
    return initialCategories;
  });

  // Save to localStorage whenever menuItems changes
  useEffect(() => {
    console.log('Saving menu items to storage:', menuItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menuItems));
  }, [menuItems]);

  // Save to localStorage whenever dietaryRestrictions changes
  useEffect(() => {
    localStorage.setItem(DIETARY_STORAGE_KEY, JSON.stringify(dietaryRestrictions));
  }, [dietaryRestrictions]);

  // Save to localStorage whenever categories changes
  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    console.log('Updating menu item:', id, updates);
    setMenuItems(items => {
      const updated = items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      console.log('Updated menu items:', updated);
      return updated;
    });
  };

  const addMenuItem = (item: MenuItem) => {
    console.log('Adding new menu item:', item);
    setMenuItems(items => {
      const updated = [...items, item];
      console.log('Updated menu items after add:', updated);
      return updated;
    });
  };

  const deleteMenuItem = (id: string) => {
    console.log('Deleting menu item:', id);
    setMenuItems(items => {
      const updated = items.filter(item => item.id !== id);
      console.log('Updated menu items after delete:', updated);
      return updated;
    });
  };

  const addDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(prev => {
      if (!prev.includes(restriction)) {
        return [...prev, restriction];
      }
      return prev;
    });
  };

  const removeDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(prev => prev.filter(r => r !== restriction));
  };

  const addCategory = (category: string) => {
    setCategories(prev => {
      if (!prev.includes(category)) {
        return [...prev, category];
      }
      return prev;
    });
  };

  const removeCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  return (
    <MenuContext.Provider value={{ 
      menuItems, 
      dietaryRestrictions,
      categories,
      updateMenuItem, 
      addMenuItem, 
      deleteMenuItem,
      addDietaryRestriction,
      removeDietaryRestriction,
      addCategory,
      removeCategory
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
} 