import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { menuItems as initialMenuItems, MenuItem, categories } from '@/data/menu-items';

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

const STORAGE_KEY = 'menu-items';
const DIETARY_STORAGE_KEY = 'dietary-restrictions';
const CATEGORIES_STORAGE_KEY = 'menu-categories';
const ALLERGENS_STORAGE_KEY = 'menu-allergens';
const MENU_VERSION_KEY = 'menu-version';
const CURRENT_MENU_VERSION = '1.0.0';

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
    try {
      // Check if we need to clear the menu items due to version mismatch
      const storedVersion = localStorage.getItem(MENU_VERSION_KEY);
      if (storedVersion !== CURRENT_MENU_VERSION) {
        console.log('Menu version mismatch, clearing stored items');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(MENU_VERSION_KEY, CURRENT_MENU_VERSION);
        return initialMenuItems;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('=== Menu Items Loading Debug ===');
      console.log('Raw stored data:', stored);
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('Successfully parsed menu items:', parsed);
          console.log('Number of items:', parsed.length);
          
          // Ensure all menu items have proper dietary info
          const normalizedItems = parsed.map((item: MenuItem) => ({
            ...item,
            dietaryInfo: {
              vegan: Boolean(item.dietaryInfo?.vegan),
              glutenFree: Boolean(item.dietaryInfo?.glutenFree),
              nutFree: Boolean(item.dietaryInfo?.nutFree),
              dairyFree: Boolean(item.dietaryInfo?.dairyFree),
              halal: Boolean(item.dietaryInfo?.halal),
              kosher: Boolean(item.dietaryInfo?.kosher),
              ...item.dietaryInfo
            }
          }));
          
          console.log('Normalized menu items:', normalizedItems);
          console.log('Number of normalized items:', normalizedItems.length);
          return normalizedItems;
        } catch (e) {
          console.error('Failed to parse stored menu items:', e);
          console.error('Error details:', e.message);
          console.error('Error stack:', e.stack);
          // If parsing fails, clear the corrupted data
          localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        console.log('No stored menu items found in localStorage');
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
    
    // If no stored items or parsing failed, use initial items
    console.log('Using initial menu items');
    console.log('Initial items:', initialMenuItems);
    console.log('Number of initial items:', initialMenuItems.length);
    return initialMenuItems;
  });

  // Save to localStorage whenever menuItems changes
  useEffect(() => {
    try {
      console.log('Saving menu items to storage:', menuItems);
      const serialized = JSON.stringify(menuItems);
      console.log('Serialized data:', serialized);
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(MENU_VERSION_KEY, CURRENT_MENU_VERSION);
      console.log('Successfully saved to localStorage');
    } catch (e) {
      console.error('Error saving menu items to localStorage:', e);
    }
  }, [menuItems]);

  // Add effect to initialize menu items if empty
  useEffect(() => {
    if (menuItems.length === 0) {
      console.log('No menu items found, initializing with default items');
      setMenuItems(initialMenuItems);
    }
  }, [menuItems.length]);

  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(() => {
    const stored = localStorage.getItem(DIETARY_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure all initial restrictions are included
        const allRestrictions = new Set([...initialDietaryRestrictions, ...parsed]);
        return Array.from(allRestrictions);
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

  const [allergens, setAllergens] = useState<string[]>(() => {
    const stored = localStorage.getItem(ALLERGENS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored allergens:', e);
      }
    }
    return initialAllergens;
  });

  // Save dietary restrictions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DIETARY_STORAGE_KEY, JSON.stringify(dietaryRestrictions));
    } catch (e) {
      console.error('Error saving dietary restrictions to localStorage:', e);
    }
  }, [dietaryRestrictions]);

  // Save categories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories to localStorage:', e);
    }
  }, [categories]);

  // Save allergens to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ALLERGENS_STORAGE_KEY, JSON.stringify(allergens));
    } catch (e) {
      console.error('Error saving allergens to localStorage:', e);
    }
  }, [allergens]);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prevItems => {
      const updatedItems = prevItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      return updatedItems;
    });
  }, []);

  const addMenuItem = useCallback((item: MenuItem) => {
    setMenuItems(prevItems => [...prevItems, item]);
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
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
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MENU_VERSION_KEY);
    setMenuItems(initialMenuItems);
  }, []);

  const forceRefreshMenuItems = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MENU_VERSION_KEY);
    setMenuItems(initialMenuItems);
  }, []);

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