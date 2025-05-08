import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
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
const initialCategories = ['Breads', 'Pastries', 'Baked Goods', 'Specialty Items'];

const batchedStorage = {
  queue: new Map(),
  timeout: null as NodeJS.Timeout | null,
  
  set(key: string, value: any) {
    this.queue.set(key, value);
    if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), 1000);
    }
  },
  
  flush() {
    this.queue.forEach((value, key) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    this.queue.clear();
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
};

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
    batchedStorage.set(STORAGE_KEY, menuItems);
  }, [menuItems]);

  // Save to localStorage whenever dietaryRestrictions changes
  useEffect(() => {
    localStorage.setItem(DIETARY_STORAGE_KEY, JSON.stringify(dietaryRestrictions));
  }, [dietaryRestrictions]);

  // Save to localStorage whenever categories changes
  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  // Memoize handlers
  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuItems(items => {
      const updated = items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      batchedStorage.set(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  const addMenuItem = useCallback((item: MenuItem) => {
    setMenuItems(items => {
      const updated = [...items, item];
      batchedStorage.set(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems(items => {
      const updated = items.filter(item => item.id !== id);
      batchedStorage.set(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

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

  // Memoize context value
  const contextValue = useMemo(() => ({
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
  }), [
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
  ]);

  // Cleanup storage on unmount
  useEffect(() => {
    return () => {
      if (batchedStorage.timeout) {
        batchedStorage.flush();
      }
    };
  }, []);

  return (
    <MenuContext.Provider value={contextValue}>
      {children}
    </MenuContext.Provider>
  );
}

// Selector hooks
export function useMenuItem(id: string) {
  const { menuItems } = useMenu();
  return useMemo(() => menuItems.find(item => item.id === id), [menuItems, id]);
}

export function useFilteredMenuItems(category: string, available: boolean = true) {
  const { menuItems } = useMenu();
  return useMemo(() => 
    menuItems.filter(item => 
      (!category || item.category === category) &&
      (!available || item.available)
    ),
    [menuItems, category, available]
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
} 