import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Pencil, Image as ImageIcon, AlertTriangle, Vegan, EggOff, MilkOff, WheatOff, Star } from "lucide-react";
import { MenuItem, categories, initialAllergens, validateMenuItem, updateMenuItem as updateMenuItemHelper, createMenuItem } from '@/data/menu-items';
import { useMenu, useMenuItem } from '@/contexts/MenuContext';
import { debounce } from '@/lib/utils';
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
    
    console.log('Initializing form state with:', {
      ...initialState,
      dietaryInfo: initialDietaryInfo
    });
    
    return {
      ...initialState,
      dietaryInfo: initialDietaryInfo,
      allergens: initialState.allergens || {}
    };
  });
  
  const handleChange = useCallback((field: keyof MenuItem, value: any) => {
    console.log('Form field changed:', field, value);
    if (field === 'dietaryInfo') {
      console.log('Current dietary info:', formState.dietaryInfo);
      console.log('New dietary info:', value);
      setFormState(prev => {
        const updatedDietaryInfo = {
          ...prev.dietaryInfo,
          ...value
        };
        console.log('Updated dietary info:', updatedDietaryInfo);
        return {
          ...prev,
          dietaryInfo: updatedDietaryInfo
        };
      });
    } else if (field === 'allergens') {
      console.log('Current allergens:', formState.allergens);
      console.log('New allergens:', value);
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
    
    console.log('Resetting form state to:', {
      ...initialState,
      dietaryInfo: initialDietaryInfo
    });
    
    setFormState({
      ...initialState,
      dietaryInfo: initialDietaryInfo,
      allergens: initialState.allergens || {}
    });
  }, [initialState]);

  return { formState, handleChange, resetForm };
}

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
    dietaryRestrictions
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

  const initialFormState = useMemo(() => ({
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
    allergens: Object.fromEntries(allergens.map(allergen => [allergen, false])),
    isSpecial: false,
    bestSeller: false,
    seasonal: false
  }), [categories, allergens]);

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
        break;
      case 'madeToOrder':
        handleNewItemChange('stock', 0);
        break;
      case 'outOfStock':
        handleNewItemChange('stock', -1);
        break;
    }
  };

  const handleAddItem = useCallback(() => {
    try {
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
        allergens: newItem.allergens || Object.fromEntries(allergens.map(allergen => [allergen, false])),
        isSpecial: newItem.isSpecial || false,
        bestSeller: newItem.bestSeller || false,
        seasonal: newItem.seasonal || false,
        image: newItem.image || '',
        // New fields
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
        setError(validation.errors.join('\n'));
        return;
      }

      setConfirmDialog({
        open: true,
        title: 'Add Menu Item',
        description: 'Are you sure you want to add this menu item? This action cannot be undone.',
        action: () => {
          addMenuItem(itemToAdd);
          setIsAddingNew(false);
          resetForm();
          setConfirmDialog({ open: false, title: '', description: '', action: () => {} });
        }
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      setError('Failed to add menu item. Please try again.');
    }
  }, [newItem, addMenuItem, resetForm, categories, allergens]);

  const debouncedUpdateItem = useMemo(
    () => debounce((id: string, updates: Partial<MenuItem>) => {
      try {
        const currentItem = menuItems.find(item => item.id === id);
        if (!currentItem) {
          throw new Error('Item not found');
        }

        const updatedItem = updateMenuItemHelper(currentItem, updates);
        const validation = validateMenuItem(updatedItem);
        if (!validation.isValid) {
          setError(validation.errors.join('\n'));
          return;
        }

        setConfirmDialog({
          open: true,
          title: 'Update Menu Item',
          description: 'Are you sure you want to update this menu item? This action cannot be undone.',
          action: () => {
            updateMenuItem(id, updates);
            setSelectedItemId(null);
            setConfirmDialog({ open: false, title: '', description: '', action: () => {} });
          }
        });
      } catch (error) {
        console.error('Error updating menu item:', error);
        setError('Failed to update menu item. Please try again.');
      }
    }, 300),
    [updateMenuItem, menuItems]
  );

  const handleDeleteItem = useCallback((id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Menu Item',
      description: 'Are you sure you want to delete this menu item? This action cannot be undone.',
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
      debouncedUpdateItem(id, { [field]: value });
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
              {menuItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
            <TableCell 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleQuickEdit(item.id, 'price', item.price)}
            >
              {editingCell?.id === item.id && editingCell?.field === 'price' ? (
                <Input
                  type="number"
                  step="0.01"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleQuickEditSave(item.id, 'price')}
                  onKeyDown={(e) => handleQuickEditKeyDown(e, item.id, 'price')}
                  className="w-24 h-8"
                  autoFocus
                />
              ) : (
                `$${item.price.toFixed(2)}`
              )}
            </TableCell>
            <TableCell 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleQuickEdit(item.id, 'stock', item.stock)}
            >
              {editingCell?.id === item.id && editingCell?.field === 'stock' ? (
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleQuickEditSave(item.id, 'stock')}
                  onKeyDown={(e) => handleQuickEditKeyDown(e, item.id, 'stock')}
                  className="w-20 h-8"
                  autoFocus
                />
              ) : (
                item.stock
              )}
            </TableCell>
            <TableCell>
              {item.stock >= 1 ? (
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  In Stock
                </Badge>
              ) : item.stock === 0 ? (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  Made to Order
                </Badge>
              ) : (
                <Badge variant="destructive">
                  Out of Stock
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <Switch
                checked={item.active}
                onCheckedChange={(checked) => {
                  debouncedUpdateItem(item.id, { active: checked });
                }}
                className="data-[state=checked]:bg-bakery-brown"
              />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <TooltipProvider>
                  {item.dietaryInfo.vegan && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Vegan size={16} className="text-green-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Vegan - Contains no animal products</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {item.dietaryInfo.glutenFree && (
                    <Tooltip>
                      <TooltipTrigger>
                        <WheatOff size={16} className="text-yellow-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Gluten Free - No wheat, rye, or barley</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {item.dietaryInfo.nutFree && (
                    <Tooltip>
                      <TooltipTrigger>
                        <EggOff size={16} className="text-yellow-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Nut Free - No nuts or nut products</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {item.dietaryInfo.dairyFree && (
                    <Tooltip>
                      <TooltipTrigger>
                        <MilkOff size={16} className="text-blue-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Dairy Free - No milk or dairy products</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {item.dietaryInfo.halal && (
                    <Tooltip>
                      <TooltipTrigger>
                        <img src="/images/halalwhite.jpg" alt="Halal" className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Halal - Prepared according to Islamic dietary laws</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {item.dietaryInfo.kosher && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Star size={16} className="text-purple-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Kosher - Prepared according to Jewish dietary laws</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            </TableCell>
                  <TableCell>
              <div className="flex flex-wrap gap-1">
                {Object.entries(item.allergens).map(([allergen, present]) => 
                  present && (
                    <Badge key={allergen} variant="outline" className="text-red-600 border-red-600">
                      {allergen.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                  )
                )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                  onClick={() => setSelectedItemId(item.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => handleNewItemChange('price', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newItem.stock}
                  onChange={(e) => handleStockChange(parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  {newItem.stock > 0 ? (
                    "Item is available and in stock"
                  ) : newItem.stock === 0 ? (
                    "Item is set to made-to-order"
                  ) : (
                    "Item is out of stock"
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Allergens</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newAllergen = prompt('Enter new allergen name:');
                    if (newAllergen) {
                      addAllergen(newAllergen);
                      const updatedAllergens = {
                        ...newItem.allergens,
                        [newAllergen]: false
                      };
                      handleNewItemChange('allergens', updatedAllergens);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Allergen
                </Button>
                </div>
              <div className="grid grid-cols-2 gap-2">
                {allergens.map(allergen => (
                  <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                      id={allergen}
                      checked={Boolean(newItem.allergens?.[allergen])}
                      onCheckedChange={(checked) => {
                        console.log('Changing allergen:', allergen, checked);
                        const updatedAllergens = {
                          ...newItem.allergens,
                          [allergen]: checked
                        };
                        console.log('Updated allergens:', updatedAllergens);
                        handleNewItemChange('allergens', updatedAllergens);
                      }}
                    />
                    <Label htmlFor={allergen} className="capitalize">
                      {allergen.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Dietary Information</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDietary = prompt('Enter new dietary restriction name:');
                    if (newDietary) {
                      addDietaryRestriction(newDietary);
                      const updatedDietaryInfo = {
                        ...newItem.dietaryInfo,
                        [newDietary]: false
                      };
                      handleNewItemChange('dietaryInfo', updatedDietaryInfo);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Dietary Restriction
                </Button>
                </div>
              <div className="grid grid-cols-2 gap-2">
                {dietaryRestrictions.map(restriction => {
                  const isChecked = Boolean(newItem.dietaryInfo?.[restriction]);
                  console.log(`Dietary restriction ${restriction} is checked:`, isChecked);
                  return (
                    <div key={restriction} className="flex items-center space-x-2">
                  <Checkbox
                        id={restriction}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          console.log('Changing dietary restriction:', restriction, checked);
                          const updatedDietaryInfo = {
                            ...newItem.dietaryInfo,
                            [restriction]: checked
                          };
                          console.log('Updated dietary info:', updatedDietaryInfo);
                          handleNewItemChange('dietaryInfo', updatedDietaryInfo);
                        }}
                      />
                      <Label htmlFor={restriction} className="capitalize">
                        {restriction.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                </div>
                  );
                })}
              </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={newItem.sku || ''}
                  onChange={(e) => handleNewItemChange('sku', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchSize">Batch Size</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={newItem.batchSize || ''}
                  onChange={(e) => handleNewItemChange('batchSize', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrder">Minimum Order Quantity</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={newItem.minimumOrderQuantity || ''}
                  onChange={(e) => handleNewItemChange('minimumOrderQuantity', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOrder">Maximum Order Quantity</Label>
                <Input
                  id="maxOrder"
                  type="number"
                  value={newItem.maximumOrderQuantity || ''}
                  onChange={(e) => handleNewItemChange('maximumOrderQuantity', parseInt(e.target.value))}
                />
              </div>
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
              <Label htmlFor="shelfLife">Shelf Life (days)</Label>
              <Input
                id="shelfLife"
                type="number"
                value={newItem.shelfLife || ''}
                onChange={(e) => handleNewItemChange('shelfLife', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
              <Input
                id="ingredients"
                value={newItem.ingredients?.join(', ') || ''}
                onChange={(e) => handleNewItemChange('ingredients', e.target.value.split(',').map(i => i.trim()))}
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
    </div>
  );
} 