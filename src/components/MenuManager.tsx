import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Pencil, Image as ImageIcon, AlertTriangle, Vegan, EggOff, MilkOff, WheatOff, Star, AlertCircle, Loader2 } from "lucide-react";
import { MenuItem } from '@/data/types';
import { menuItems as initialMenuItems } from '@/data/menu-items';
import { initialAllergens, categories, dietaryRestrictions } from '@/data/initial-data';
import { useMenu, useMenuItem } from '@/contexts/MenuContext';
import { debounce } from '@/lib/utils';
import { validateMenuItem } from '@/lib/validation';
import { createMenuItem, updateMenuItem } from '@/lib/menu-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Form handling hook
function useMenuForm(initialState: Partial<MenuItem>) {
  const [formState, setFormState] = useState<Partial<MenuItem>>(() => {
    const initialDietaryInfo = {
      vegan: false,
      glutenFree: false,
      nutFree: false,
      dairyFree: false,
      halal: false,
      kosher: false,
      ...(initialState.dietaryInfo || {})
    };
    
    const initialAllergensState = {
      wheat: false,
      nuts: false,
      coconut: false,
      milk: false,
      eggs: false,
      soy: false,
      sesame: false,
      shellfish: false,
      fish: false,
      peanuts: false,
      treeNuts: false,
      sulfites: false,
      ...(initialState.allergens || {})
    };
    
    return {
      ...initialState,
      dietaryInfo: initialDietaryInfo,
      allergens: initialAllergensState
    };
  });
  
  const handleChange = useCallback((field: keyof MenuItem, value: any) => {
    if (field === 'dietaryInfo') {
      setFormState(prev => ({
        ...prev,
        dietaryInfo: {
          ...prev.dietaryInfo,
          ...value
        }
      }));
    } else if (field === 'allergens') {
      setFormState(prev => ({
        ...prev,
        allergens: {
          ...prev.allergens,
          ...value
        }
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, []);

  const resetForm = useCallback(() => {
    const initialDietaryInfo = {
      vegan: false,
      glutenFree: false,
      nutFree: false,
      dairyFree: false,
      halal: false,
      kosher: false,
      ...(initialState.dietaryInfo || {})
    };
    
    const initialAllergensState = {
      wheat: false,
      nuts: false,
      coconut: false,
      milk: false,
      eggs: false,
      soy: false,
      sesame: false,
      shellfish: false,
      fish: false,
      peanuts: false,
      treeNuts: false,
      sulfites: false,
      ...(initialState.allergens || {})
    };
    
    setFormState({
      ...initialState,
      dietaryInfo: initialDietaryInfo,
      allergens: initialAllergensState
    });
  }, [initialState]);

  return { formState, handleChange, resetForm };
}

// Add this helper function at the top level
const parseNumberInput = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export function MenuManager() {
  const { 
    menuItems, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem, 
    addCategory,
    addAllergen,
    addDietaryRestriction,
    categories,
    allergens,
    dietaryRestrictions,
    isGitHubEnabled,
    gitHubError
  } = useMenu();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{id: string, field: 'price' | 'stock'} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const selectedItem = useMenuItem(selectedItemId || '');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {}
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({
    open: false,
    title: '',
    description: ''
  });

  const initialFormState = useMemo(() => {
    const allergens = Object.fromEntries(
      initialAllergens.map(allergen => [allergen, false])
    ) as {
      [key: string]: boolean;
      wheat: boolean;
      nuts: boolean;
      coconut: boolean;
      milk: boolean;
      eggs: boolean;
      soy: boolean;
      sesame: boolean;
      shellfish: boolean;
      fish: boolean;
      peanuts: boolean;
      treeNuts: boolean;
      sulfites: boolean;
    };

    return {
      name: '',
      description: '',
      price: 0,
      category: categories[0],
      stock: 0,
      madeToOrder: false,
      available: true,
      active: true,
      dietaryInfo: {
        vegan: false,
        glutenFree: false,
        nutFree: false,
        dairyFree: false,
        halal: false,
        kosher: false
      },
      allergens,
      isSpecial: false,
      bestSeller: false,
      seasonal: false
    };
  }, [categories]);

  const { formState: newItem, handleChange: handleNewItemChange, resetForm } = useMenuForm(
    isAddingNew ? initialFormState : selectedItem || initialFormState
  );

  // Reset form when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      console.log('Selected item:', selectedItem);
      handleNewItemChange('name', selectedItem.name);
      handleNewItemChange('description', selectedItem.description);
      handleNewItemChange('price', selectedItem.price);
      handleNewItemChange('category', selectedItem.category);
      handleNewItemChange('stock', selectedItem.stock);
      handleNewItemChange('madeToOrder', selectedItem.stock === 0);
      handleNewItemChange('available', selectedItem.stock >= 0);
      handleNewItemChange('active', selectedItem.active);
      
      // Ensure dietary info is properly initialized
      const dietaryInfo = {
        vegan: Boolean(selectedItem.dietaryInfo?.vegan),
        glutenFree: Boolean(selectedItem.dietaryInfo?.glutenFree),
        nutFree: Boolean(selectedItem.dietaryInfo?.nutFree),
        dairyFree: Boolean(selectedItem.dietaryInfo?.dairyFree),
        halal: Boolean(selectedItem.dietaryInfo?.halal),
        kosher: Boolean(selectedItem.dietaryInfo?.kosher)
      };
      console.log('Setting dietary info:', dietaryInfo);
      handleNewItemChange('dietaryInfo', dietaryInfo);
      
      // Ensure allergens are properly initialized
      const allergens = { ...selectedItem.allergens };
      console.log('Setting allergens:', allergens);
      handleNewItemChange('allergens', allergens);
      
      handleNewItemChange('isSpecial', selectedItem.isSpecial);
      handleNewItemChange('bestSeller', selectedItem.bestSeller);
      handleNewItemChange('seasonal', selectedItem.seasonal);
    }
  }, [selectedItem, handleNewItemChange]);

  // Add stock change handler
  const handleStockChange = (value: number) => {
    handleNewItemChange('stock', value);
  };

  // Add stock status handler
  const handleStockStatusChange = (status: 'inStock' | 'madeToOrder' | 'outOfStock') => {
    switch (status) {
      case 'inStock':
        handleNewItemChange('stock', 1);
        handleNewItemChange('madeToOrder', false);
        break;
      case 'madeToOrder':
        handleNewItemChange('stock', 0);
        handleNewItemChange('madeToOrder', true);
        break;
      case 'outOfStock':
        handleNewItemChange('stock', -1);
        handleNewItemChange('madeToOrder', false);
        break;
    }
  };

  const handleAddItem = useCallback(() => {
    try {
      const allergens = Object.fromEntries(
        initialAllergens.map(allergen => [allergen, false])
      );

      const itemToAdd = createMenuItem({
        name: newItem.name || '',
        description: newItem.description || '',
        price: newItem.price || 0,
        category: newItem.category || categories[0],
        stock: newItem.stock || 0,
        madeToOrder: newItem.madeToOrder || false,
        available: newItem.available || true,
        active: newItem.active || true,
        dietaryInfo: {
          vegan: newItem.dietaryInfo?.vegan || false,
          glutenFree: newItem.dietaryInfo?.glutenFree || false,
          nutFree: newItem.dietaryInfo?.nutFree || false,
          dairyFree: newItem.dietaryInfo?.dairyFree || false,
          halal: newItem.dietaryInfo?.halal || false,
          kosher: newItem.dietaryInfo?.kosher || false
        },
        allergens: {
          ...allergens,
          ...newItem.allergens
        },
        isSpecial: newItem.isSpecial || false,
        bestSeller: newItem.bestSeller || false,
        seasonal: newItem.seasonal || false,
        image: newItem.image || '',
        sku: newItem.sku,
        minimumOrderQuantity: newItem.minimumOrderQuantity,
        maximumOrderQuantity: newItem.maximumOrderQuantity,
        batchSize: newItem.batchSize,
        storageInstructions: newItem.storageInstructions,
        shelfLife: newItem.shelfLife,
        ingredients: newItem.ingredients,
        allergensList: newItem.allergensList,
        crossContamination: newItem.crossContamination,
        customizations: newItem.customizations,
        tags: newItem.tags,
        notes: newItem.notes
      });

      const validation = validateMenuItem(itemToAdd);
      if (!validation.isValid) {
        setErrorDialog({
          open: true,
          title: 'Validation Error',
          description: validation.errors.join('\n')
        });
        return;
      }

      addMenuItem(itemToAdd);
      setIsAddingNew(false);
      resetForm();
    } catch (error) {
      console.error('Error adding menu item:', error);
      setErrorDialog({
        open: true,
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add menu item. Please try again.'
      });
    }
  }, [newItem, addMenuItem, resetForm, categories]);

  const debouncedUpdateItem = useMemo(
    () => debounce((id: string, updates: Partial<MenuItem>) => {
      try {
        setIsSaving(true);
        const currentItem = menuItems.find(item => item.id === id);
        if (!currentItem) {
          throw new Error('Item not found');
        }

        // If updating stock, also update madeToOrder status
        if ('stock' in updates) {
          updates.madeToOrder = updates.stock === 0;
        }

        const updatedItem = { ...currentItem, ...updates };
        
        // For price and stock updates, only validate those fields
        if (Object.keys(updates).every(key => ['price', 'stock', 'madeToOrder'].includes(key))) {
          if (updates.price !== undefined && (isNaN(updates.price) || updates.price < 0)) {
            setErrorDialog({
              open: true,
              title: 'Invalid Price',
              description: 'Price must be a positive number'
            });
            setIsSaving(false);
            return;
          }
          if (updates.stock !== undefined && (isNaN(updates.stock) || updates.stock < -1)) {
            setErrorDialog({
              open: true,
              title: 'Invalid Stock',
              description: 'Stock must be -1 (out of stock), 0 (made to order), or a positive number'
            });
            setIsSaving(false);
            return;
          }
          updateMenuItem(id, updates);
          setIsSaving(false);
          return;
        }

        // For other updates, do full validation
        const validation = validateMenuItem(updatedItem);
        if (!validation.isValid) {
          setErrorDialog({
            open: true,
            title: 'Validation Error',
            description: validation.errors.join('\n')
          });
          setIsSaving(false);
          return;
        }

        setConfirmDialog({
          open: true,
          title: 'Update Menu Item',
          description: 'Would you like to save these changes?',
          action: () => {
            updateMenuItem(id, updates);
            setSelectedItemId(null);
            setConfirmDialog({ open: false, title: '', description: '', action: () => {} });
            setIsSaving(false);
          }
        });
      } catch (error) {
        console.error('Error updating menu item:', error);
        setErrorDialog({
          open: true,
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update menu item. Please try again.'
        });
        setIsSaving(false);
      }
    }, 100),
    [updateMenuItem, menuItems]
  );

  const handleDeleteItem = useCallback((id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Menu Item',
      description: 'Are you sure you want to delete this menu item? This cannot be undone.',
      action: () => {
        try {
          deleteMenuItem(id);
          setConfirmDialog({ open: false, title: '', description: '', action: () => {} });
        } catch (error) {
          console.error('Error deleting menu item:', error);
          setError('Failed to delete menu item. Please try again.');
        }
      }
    });
  }, [deleteMenuItem]);

  // Add quick edit handlers
  const handleQuickEdit = (id: string, field: 'price' | 'stock', value: number) => {
    setEditingCell({ id, field });
    setEditValue(value.toString());
  };

  const handleQuickEditSave = (id: string, field: 'price' | 'stock') => {
    const value = field === 'price' ? parseFloat(editValue) : parseInt(editValue);
    if (!isNaN(value)) {
      // Validate the value before updating
      if (field === 'price' && value < 0) {
        setErrorDialog({
          open: true,
          title: 'Invalid Price',
          description: 'Price must be a positive number'
        });
        setEditingCell(null);
        return;
      }
      if (field === 'stock' && value < -1) {
        setErrorDialog({
          open: true,
          title: 'Invalid Stock',
          description: 'Stock must be -1 (out of stock), 0 (made to order), or a positive number'
        });
        setEditingCell(null);
        return;
      }
      const updates = { 
        [field]: value,
        ...(field === 'stock' ? { 
          madeToOrder: value === 0,
          available: value >= 0
        } : {})
      };
      updateMenuItem(id, updates);
    }
    setEditingCell(null);
  };

  const handleQuickEditKeyDown = (e: React.KeyboardEvent, id: string, field: 'price' | 'stock') => {
    if (e.key === 'Enter') {
      handleQuickEditSave(id, field);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Add this function to check for errors in a menu item
  const hasMenuItemErrors = (item: MenuItem): boolean => {
    const validation = validateMenuItem(item);
    return !validation.isValid;
  };

  const menuTable = useMemo(() => (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Dietary Info</TableHead>
                <TableHead>Allergens</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!validateMenuItem(item).isValid && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{validateMenuItem(item).errors.join('\n')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    {editingCell?.id === item.id && editingCell?.field === 'price' ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleQuickEditKeyDown(e, item.id, 'price')}
                        onBlur={() => handleQuickEditSave(item.id, 'price')}
                        autoFocus
                        className="w-20"
                      />
                    ) : (
                      <div 
                        onClick={() => handleQuickEdit(item.id, 'price', item.price)}
                        className="cursor-pointer hover:bg-muted p-1 rounded"
                      >
                        ${Number(item.price || 0).toFixed(2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell?.id === item.id && editingCell?.field === 'stock' ? (
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleQuickEditKeyDown(e, item.id, 'stock')}
                        onBlur={() => handleQuickEditSave(item.id, 'stock')}
                        autoFocus
                        className="w-20"
                      />
                    ) : (
                      <div 
                        onClick={() => handleQuickEdit(item.id, 'stock', item.stock)}
                        className="cursor-pointer hover:bg-muted p-1 rounded"
                      >
                        {item.stock}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{item.stock > 0 ? "In Stock" : item.stock === 0 ? "Made to Order" : "Out of Stock"}</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.active}
                      onCheckedChange={(checked) => {
                        debouncedUpdateItem(item.id, { active: checked });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(item.dietaryInfo)
                        .filter(([_, value]) => value)
                        .map(([key]) => {
                          let Icon;
                          let color;
                          switch (key) {
                            case 'vegan':
                              Icon = Vegan;
                              color = 'text-green-600';
                              break;
                            case 'glutenFree':
                              Icon = WheatOff;
                              color = 'text-orange-600';
                              break;
                            case 'dairyFree':
                              Icon = MilkOff;
                              color = 'text-blue-600';
                              break;
                            case 'nutFree':
                              Icon = EggOff;
                              color = 'text-red-600';
                              break;
                            case 'halal':
                              return (
                                <TooltipProvider key={key}>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <img src="/images/halalwhite.jpg" alt="Halal" className="h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            case 'kosher':
                              Icon = Star;
                              color = 'text-yellow-600';
                              break;
                            default:
                              return null;
                          }
                          return (
                            <TooltipProvider key={key}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Icon className={`h-4 w-4 ${color}`} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(item.allergens)
                        .filter(([_, value]) => value)
                        .map(([key]) => (
                          <Badge key={key} variant="destructive" className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setIsAddingNew(false);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
  ), [menuItems, handleDeleteItem, editingCell, editValue]);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {gitHubError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>GitHub Sync Error</AlertTitle>
          <AlertDescription>{gitHubError}</AlertDescription>
        </Alert>
      )}

      {!isGitHubEnabled && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>GitHub Integration Disabled</AlertTitle>
          <AlertDescription>
            Menu items will not be saved to GitHub. Please check your GitHub token configuration.
          </AlertDescription>
        </Alert>
      )}

      {isSaving && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Saving Changes</AlertTitle>
          <AlertDescription>Please wait while your changes are being saved...</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <Button onClick={() => setIsAddingNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          {menuTable}
        </CardContent>
      </Card>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isAddingNew || !!selectedItem} onOpenChange={() => {
        setIsAddingNew(false);
        setSelectedItemId(null);
        resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isAddingNew ? 'Add New Menu Item' : 'Edit Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newItem.name || ''}
                  onChange={(e) => handleNewItemChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Categories</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newCategory = prompt('Enter new category name:');
                      if (newCategory) {
                        addCategory(newCategory);
                        handleNewItemChange('category', newCategory);
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Category
                  </Button>
                </div>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => handleNewItemChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => handleNewItemChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.price || 0}
                  onChange={(e) => handleNewItemChange('price', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="-1"
                  value={newItem.stock || 0}
                  onChange={(e) => {
                    const stockValue = parseInt(e.target.value);
                    handleNewItemChange('stock', stockValue);
                    // Auto-update made-to-order status based on stock value
                    if (stockValue >= 1) {
                      handleNewItemChange('madeToOrder', false);
                    } else if (stockValue === 0) {
                      handleNewItemChange('madeToOrder', true);
                    } else {
                      handleNewItemChange('madeToOrder', false);
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumOrderQuantity">Minimum Order Quantity</Label>
              <Input
                id="minimumOrderQuantity"
                type="number"
                min="1"
                value={newItem.minimumOrderQuantity || 1}
                onChange={(e) => handleNewItemChange('minimumOrderQuantity', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximumOrderQuantity">Maximum Order Quantity</Label>
              <Input
                id="maximumOrderQuantity"
                type="number"
                min="1"
                value={newItem.maximumOrderQuantity || 1}
                onChange={(e) => handleNewItemChange('maximumOrderQuantity', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchSize">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                min="1"
                value={newItem.batchSize || 1}
                onChange={(e) => handleNewItemChange('batchSize', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shelfLife">Shelf Life (days)</Label>
              <Input
                id="shelfLife"
                type="number"
                min="1"
                value={newItem.shelfLife || 1}
                onChange={(e) => handleNewItemChange('shelfLife', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Item Settings</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="inStock"
                        name="stockStatus"
                        checked={newItem.stock >= 1}
                        onChange={() => handleStockStatusChange('inStock')}
                        className="h-4 w-4 text-bakery-brown border-gray-300 focus:ring-bakery-brown"
                      />
                      <Label htmlFor="inStock" className="font-normal">In Stock</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="madeToOrder"
                        name="stockStatus"
                        checked={newItem.stock === 0}
                        onChange={() => handleStockStatusChange('madeToOrder')}
                        className="h-4 w-4 text-bakery-brown border-gray-300 focus:ring-bakery-brown"
                      />
                      <Label htmlFor="madeToOrder" className="font-normal">Made to Order</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="outOfStock"
                        name="stockStatus"
                        checked={newItem.stock < 0}
                        onChange={() => handleStockStatusChange('outOfStock')}
                        className="h-4 w-4 text-bakery-brown border-gray-300 focus:ring-bakery-brown"
                      />
                      <Label htmlFor="outOfStock" className="font-normal">Out of Stock</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Settings</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSpecial"
                      checked={newItem.isSpecial}
                      onCheckedChange={(checked) => handleNewItemChange('isSpecial', checked as boolean)}
                    />
                    <Label htmlFor="isSpecial">Special Item</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bestSeller"
                      checked={newItem.bestSeller}
                      onCheckedChange={(checked) => handleNewItemChange('bestSeller', checked as boolean)}
                    />
                    <Label htmlFor="bestSeller">Best Seller</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={newItem.sku || ''}
                onChange={(e) => handleNewItemChange('sku', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage">Storage Instructions</Label>
              <Textarea
                id="storage"
                value={newItem.storageInstructions || ''}
                onChange={(e) => handleNewItemChange('storageInstructions', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newItem.notes || ''}
                onChange={(e) => handleNewItemChange('notes', e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingNew(false);
                  setSelectedItemId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                  if (isAddingNew) {
                  handleAddItem();
                  } else if (selectedItem) {
                    debouncedUpdateItem(selectedItem.id, newItem);
                }
              }}
            >
                {isAddingNew ? 'Add Item' : 'Save Changes'}
            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => {
        if (!open) {
          setConfirmDialog({ open: false, title: '', description: '', action: () => {} });
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.action}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog 
        open={errorDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setErrorDialog({ open: false, title: '', description: '' });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {errorDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ open: false, title: '', description: '' })}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 