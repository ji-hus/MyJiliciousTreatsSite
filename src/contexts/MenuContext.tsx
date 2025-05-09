import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { 
  menuItems as initialMenuItems, 
  MenuItem, 
  categories as initialCategories,
  initialDietaryRestrictions,
  initialAllergens,
  createMenuItem,
  validateMenuItem,
  updateMenuItem as updateMenuItemHelper
} from '@/data/menu-items';
import { updateMenuItemsFile, hasGitHubToken } from '@/lib/github';

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
  isGitHubEnabled: boolean;
}

const MenuContext = createContext<MenuContextType | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([...initialDietaryRestrictions]);
  const [categories, setCategories] = useState<string[]>([...initialCategories]);
  const [allergens, setAllergens] = useState<string[]>([...initialAllergens]);
  const [isGitHubEnabled, setIsGitHubEnabled] = useState(false);

  // Check if GitHub integration is available
  useEffect(() => {
    setIsGitHubEnabled(hasGitHubToken());
  }, []);

  // Function to update menu items and sync with GitHub
  const updateMenuItems = useCallback(async (newItems: MenuItem[]) => {
    setMenuItems(newItems);
    if (isGitHubEnabled) {
      try {
        await updateMenuItemsFile(newItems);
      } catch (error) {
        console.error('Failed to update menu items on GitHub:', error);
        // You might want to show an error message to the user here
      }
    }
  }, [isGitHubEnabled]);

  // Memoize handlers
  const updateMenuItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
    const updated = menuItems.map(item => {
      if (item.id === id) {
        const newItem = updateMenuItemHelper(item, updates);
        const validation = validateMenuItem(newItem);
        if (!validation.isValid) {
          throw new Error(validation.errors.join('\n'));
        }
        return newItem;
      }
      return item;
    });
    await updateMenuItems(updated);
  }, [menuItems, updateMenuItems]);

  const addMenuItem = useCallback(async (item: MenuItem) => {
    const validation = validateMenuItem(item);
    if (!validation.isValid) {
      throw new Error(validation.errors.join('\n'));
    }
    await updateMenuItems([...menuItems, item]);
  }, [menuItems, updateMenuItems]);

  const deleteMenuItem = useCallback(async (id: string) => {
    await updateMenuItems(menuItems.filter(item => item.id !== id));
  }, [menuItems, updateMenuItems]);

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
            dietaryInfo: newDietaryInfo
          };
        });
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
    isGitHubEnabled
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
    isGitHubEnabled
  ]);

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