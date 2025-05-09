import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { MenuItem } from '@/data/types';
import { menuItems as initialMenuItems } from '@/data/menu-items';
import { initialAllergens, categories as initialCategories, dietaryRestrictions as initialDietaryRestrictions } from '@/data/initial-data';
import { createMenuItem, updateMenuItem } from '@/lib/menu-utils';
import { validateMenuItem } from '@/lib/validation';
import { updateMenuItemsFile, hasGitHubToken } from '@/lib/github';
import { config } from '@/config/env';

interface MenuContextType {
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  categories: string[];
  dietaryRestrictions: string[];
  allergens: string[];
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  saveChanges: () => Promise<void>;
  hasUnsavedChanges: boolean;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addAllergen: (allergen: string) => void;
  removeAllergen: (allergen: string) => void;
  addDietaryRestriction: (restriction: string) => void;
  removeDietaryRestriction: (restriction: string) => void;
  isGitHubEnabled: boolean;
  gitHubError: string | null;
}

const MenuContext = createContext<MenuContextType | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([...initialDietaryRestrictions]);
  const [categories, setCategories] = useState<string[]>([...initialCategories]);
  const [allergens, setAllergens] = useState<string[]>([...initialAllergens]);
  const [isGitHubEnabled, setIsGitHubEnabled] = useState(false);
  const [gitHubError, setGitHubError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check if GitHub integration is available
  useEffect(() => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const isEnabled = hasGitHubToken();
    setIsGitHubEnabled(isEnabled);
    
    if (!isEnabled) {
      console.warn('GitHub integration disabled. Please check your token configuration.');
    }
  }, []);

  // Function to update menu items and sync with GitHub
  const updateMenuItems = useCallback(async (newItems: MenuItem[]) => {
    setMenuItems(newItems);
    if (isGitHubEnabled) {
      try {
        setIsLoading(true);
        await updateMenuItemsFile(newItems);
        setGitHubError(null);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Failed to update menu items on GitHub:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to update menu items on GitHub';
        setGitHubError(`${errorMessage}. Please check your GitHub token and repository permissions.`);
        setHasUnsavedChanges(true);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isGitHubEnabled]);

  // Memoize handlers
  const updateMenuItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
    const updated = menuItems.map(item => {
      if (item.id === id) {
        const newItem = { ...item, ...updates, updatedAt: new Date().toISOString(), version: item.version + 1 };
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
    isGitHubEnabled,
    gitHubError,
    isLoading,
    error,
    setError,
    saveChanges: async () => {
      try {
        await updateMenuItems(menuItems);
        setHasUnsavedChanges(false);
        setError(null);
      } catch (error) {
        console.error('Failed to save changes:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
        setError(errorMessage);
      }
    },
    hasUnsavedChanges
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
    isGitHubEnabled,
    gitHubError,
    isLoading,
    error,
    setError,
    updateMenuItems,
    setHasUnsavedChanges
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