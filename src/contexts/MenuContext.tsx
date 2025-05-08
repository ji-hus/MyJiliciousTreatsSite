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
}

const MenuContext = createContext<MenuContextType | null>(null);

const STORAGE_KEY = 'menu-items';
const DIETARY_STORAGE_KEY = 'dietary-restrictions';
const CATEGORIES_STORAGE_KEY = 'menu-categories';
const ALLERGENS_STORAGE_KEY = 'menu-allergens';

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

  // Save to localStorage whenever dietaryRestrictions changes
  useEffect(() => {
    localStorage.setItem(DIETARY_STORAGE_KEY, JSON.stringify(dietaryRestrictions));
  }, [dietaryRestrictions]);

  // Save to localStorage whenever categories changes
  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  // Save to localStorage whenever allergens changes
  useEffect(() => {
    localStorage.setItem(ALLERGENS_STORAGE_KEY, JSON.stringify(allergens));
  }, [allergens]);

  // Add effect to log menu items changes
  useEffect(() => {
    console.log('Menu items updated:', menuItems);
    console.log('Menu items length:', menuItems.length);
    // Check for duplicate IDs
    const ids = menuItems.map(item => item.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.warn('Found duplicate menu item IDs:', ids.filter((id, index) => ids.indexOf(id) !== index));
    }
  }, [menuItems]);

  // Memoize handlers
  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    console.log('MenuContext: Updating item', id);
    console.log('MenuContext: Updates', updates);
    setMenuItems(items => {
      const updated = items.map(item => {
        if (item.id === id) {
          console.log('MenuContext: Current item', item);
          const newItem = {
            ...item,
            ...updates,
            dietaryInfo: {
              vegan: Boolean(updates.dietaryInfo?.vegan ?? item.dietaryInfo?.vegan),
              glutenFree: Boolean(updates.dietaryInfo?.glutenFree ?? item.dietaryInfo?.glutenFree),
              nutFree: Boolean(updates.dietaryInfo?.nutFree ?? item.dietaryInfo?.nutFree),
              dairyFree: Boolean(updates.dietaryInfo?.dairyFree ?? item.dietaryInfo?.dairyFree),
              halal: Boolean(updates.dietaryInfo?.halal ?? item.dietaryInfo?.halal),
              kosher: Boolean(updates.dietaryInfo?.kosher ?? item.dietaryInfo?.kosher),
              ...(updates.dietaryInfo || {})
            }
          };
          console.log('MenuContext: New item', newItem);
          return newItem;
        }
        return item;
      });
      return updated;
    });
  }, []);

  const addMenuItem = useCallback((item: MenuItem) => {
    setMenuItems(items => {
      // Ensure all dietary restrictions are initialized for the new item
      const dietaryInfo = {
        vegan: Boolean(item.dietaryInfo?.vegan),
        glutenFree: Boolean(item.dietaryInfo?.glutenFree),
        nutFree: Boolean(item.dietaryInfo?.nutFree),
        dairyFree: Boolean(item.dietaryInfo?.dairyFree),
        halal: Boolean(item.dietaryInfo?.halal),
        kosher: Boolean(item.dietaryInfo?.kosher)
      };
      
      const newItem = {
        ...item,
        dietaryInfo
      };
      
      return [...items, newItem];
    });
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems(items => {
      const updated = items.filter(item => item.id !== id);
      batchedStorage.set(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  const addDietaryRestriction = useCallback((restriction: string) => {
    setDietaryRestrictions(prev => {
      if (!prev.includes(restriction)) {
        // Update all menu items to include the new dietary restriction
        setMenuItems(items => {
          const updated = items.map(item => ({
            ...item,
            dietaryInfo: {
              ...item.dietaryInfo,
              [restriction]: false
            }
          }));
          batchedStorage.set(STORAGE_KEY, updated);
          return updated;
        });
        return [...prev, restriction];
      }
      return prev;
    });
  }, []);

  const removeDietaryRestriction = useCallback((restriction: string) => {
    setDietaryRestrictions(prev => {
      const updated = prev.filter(r => r !== restriction);
      // Update all menu items to remove the dietary restriction
      setMenuItems(items => {
        const updatedItems = items.map(item => {
          const newDietaryInfo = { ...item.dietaryInfo };
          delete newDietaryInfo[restriction as keyof typeof newDietaryInfo];
          return {
            ...item,
            dietaryInfo: newDietaryInfo as DietaryInfo
          };
        });
        batchedStorage.set(STORAGE_KEY, updatedItems);
        return updatedItems;
      });
      return updated;
    });
  }, []);

  const addCategory = useCallback((category: string) => {
    setCategories(prev => {
      if (!prev.includes(category)) {
        return [...prev, category];
      }
      return prev;
    });
  }, []);

  const removeCategory = useCallback((category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  }, []);

  const addAllergen = useCallback((allergen: string) => {
    setAllergens(prev => {
      if (!prev.includes(allergen)) {
        // Update all menu items to include the new allergen
        setMenuItems(items => {
          const updated = items.map(item => ({
            ...item,
            allergens: {
              ...item.allergens,
              [allergen]: false
            }
          }));
          batchedStorage.set(STORAGE_KEY, updated);
          return updated;
        });
        return [...prev, allergen];
      }
      return prev;
    });
  }, []);

  const removeAllergen = useCallback((allergen: string) => {
    setAllergens(prev => prev.filter(a => a !== allergen));
  }, []);

  const getMenuItem = (id: string) => {
    return menuItems.find(item => item.id === id);
  };

  const clearMenuItems = useCallback(() => {
    console.log('Clearing menu items from localStorage');
    localStorage.removeItem(STORAGE_KEY);
    setMenuItems(initialMenuItems);
  }, []);

  // Memoize context value
  const contextValue = useMemo(() => ({
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
    clearMenuItems
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
    clearMenuItems
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
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
} 