import React, { useState, useCallback, useMemo } from 'react';
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Pencil, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { MenuItem, categories, initialAllergens } from '@/data/menu-items';
import { useMenu, useMenuItem } from '@/contexts/MenuContext';
import { debounce } from '@/lib/utils';

// Form handling hook
function useMenuForm(initialState: Partial<MenuItem>) {
  const [formState, setFormState] = useState(initialState);
  
  const handleChange = useCallback((field: keyof MenuItem, value: any) => {
    setFormState(prev => ({...prev, [field]: value}));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(initialState);
  }, [initialState]);

  return { formState, handleChange, resetForm };
}

export function MenuManager() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItem = useMenuItem(selectedItemId || '');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialFormState = useMemo(() => ({
    name: '',
    description: '',
    price: 0,
    category: categories[0],
    stock: 0,
    madeToOrder: false,
    available: true,
    dietaryInfo: {
      vegan: false,
      glutenFree: false,
      nutFree: false,
      dairyFree: false
    },
    allergens: Object.fromEntries(initialAllergens.map(allergen => [allergen, false])),
    isSpecial: false,
    bestSeller: false,
    seasonal: false
  }), []);

  const { formState: newItem, handleChange: handleNewItemChange, resetForm } = useMenuForm(initialFormState);

  const handleAddItem = useCallback(async () => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add menu item');
      }

      const addedItem = await response.json();
      addMenuItem(addedItem);
      setIsAddingNew(false);
      resetForm();
    } catch (error) {
      console.error('Error adding menu item:', error);
      setError('Failed to add menu item. Please try again.');
    }
  }, [newItem, addMenuItem, resetForm]);

  const debouncedUpdateItem = useMemo(
    () => debounce(async (id: string, updates: Partial<MenuItem>) => {
      try {
        const response = await fetch(`/api/menu/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update menu item');
        }

        const updatedItem = await response.json();
        updateMenuItem(id, updatedItem);
        setSelectedItemId(null);
      } catch (error) {
        console.error('Error updating menu item:', error);
        setError('Failed to update menu item. Please try again.');
      }
    }, 300),
    [updateMenuItem]
  );

  const handleDeleteItem = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete menu item');
      }

      deleteMenuItem(id);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError('Failed to delete menu item. Please try again.');
    }
  }, [deleteMenuItem]);

  const menuTable = useMemo(() => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Dietary Info</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {menuItems.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>${item.price.toFixed(2)}</TableCell>
            <TableCell>{item.stock}</TableCell>
            <TableCell>
              <Badge variant={item.available ? "default" : "destructive"}>
                {item.available ? "Available" : "Unavailable"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {item.dietaryInfo.vegan && <Badge variant="secondary">Vegan</Badge>}
                {item.dietaryInfo.glutenFree && <Badge variant="secondary">GF</Badge>}
                {item.dietaryInfo.nutFree && <Badge variant="secondary">Nut-Free</Badge>}
                {item.dietaryInfo.dairyFree && <Badge variant="secondary">DF</Badge>}
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
  ), [menuItems, handleDeleteItem]);

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
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isAddingNew ? 'Add New Menu Item' : 'Edit Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={isAddingNew ? newItem.name : selectedItem?.name}
                  onChange={(e) => isAddingNew 
                    ? handleNewItemChange('name', e.target.value)
                    : handleNewItemChange('name', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={isAddingNew ? newItem.category : selectedItem?.category}
                  onValueChange={(value) => isAddingNew
                    ? handleNewItemChange('category', value)
                    : handleNewItemChange('category', value)
                  }
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
                value={isAddingNew ? newItem.description : selectedItem?.description}
                onChange={(e) => isAddingNew
                  ? handleNewItemChange('description', e.target.value)
                  : handleNewItemChange('description', e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={isAddingNew ? newItem.price : selectedItem?.price}
                  onChange={(e) => isAddingNew
                    ? handleNewItemChange('price', parseFloat(e.target.value))
                    : handleNewItemChange('price', parseFloat(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={isAddingNew ? newItem.stock : selectedItem?.stock}
                  onChange={(e) => isAddingNew
                    ? handleNewItemChange('stock', parseInt(e.target.value))
                    : handleNewItemChange('stock', parseInt(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dietary Information</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vegan"
                      checked={isAddingNew ? newItem.dietaryInfo?.vegan : selectedItem?.dietaryInfo.vegan}
                      onCheckedChange={(checked) => isAddingNew
                        ? handleNewItemChange('dietaryInfo', { ...newItem.dietaryInfo!, vegan: checked as boolean })
                        : handleNewItemChange('dietaryInfo', { ...selectedItem!.dietaryInfo, vegan: checked as boolean })
                      }
                    />
                    <Label htmlFor="vegan">Vegan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="glutenFree"
                      checked={isAddingNew ? newItem.dietaryInfo?.glutenFree : selectedItem?.dietaryInfo.glutenFree}
                      onCheckedChange={(checked) => isAddingNew
                        ? handleNewItemChange('dietaryInfo', { ...newItem.dietaryInfo!, glutenFree: checked as boolean })
                        : handleNewItemChange('dietaryInfo', { ...selectedItem!.dietaryInfo, glutenFree: checked as boolean })
                      }
                    />
                    <Label htmlFor="glutenFree">Gluten Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nutFree"
                      checked={isAddingNew ? newItem.dietaryInfo?.nutFree : selectedItem?.dietaryInfo.nutFree}
                      onCheckedChange={(checked) => isAddingNew
                        ? handleNewItemChange('dietaryInfo', { ...newItem.dietaryInfo!, nutFree: checked as boolean })
                        : handleNewItemChange('dietaryInfo', { ...selectedItem!.dietaryInfo, nutFree: checked as boolean })
                      }
                    />
                    <Label htmlFor="nutFree">Nut Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dairyFree"
                      checked={isAddingNew ? newItem.dietaryInfo?.dairyFree : selectedItem?.dietaryInfo.dairyFree}
                      onCheckedChange={(checked) => isAddingNew
                        ? handleNewItemChange('dietaryInfo', { ...newItem.dietaryInfo!, dairyFree: checked as boolean })
                        : handleNewItemChange('dietaryInfo', { ...selectedItem!.dietaryInfo, dairyFree: checked as boolean })
                      }
                    />
                    <Label htmlFor="dairyFree">Dairy Free</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Item Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="available"
                      checked={isAddingNew ? newItem.available : selectedItem?.available}
                      onCheckedChange={(checked) => isAddingNew
                        ? handleNewItemChange('available', checked as boolean)
                        : handleNewItemChange('available', checked as boolean)
                      }
                    />
                    <Label htmlFor="available">Available</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="madeToOrder"
                      checked={isAddingNew ? newItem.madeToOrder : selectedItem?.madeToOrder}
                      onCheckedChange={(checked) => isAddingNew
                        ? handleNewItemChange('madeToOrder', checked as boolean)
                        : handleNewItemChange('madeToOrder', checked as boolean)
                      }
                    />
                    <Label htmlFor="madeToOrder">Made to Order</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSpecial"
                      checked={isAddingNew ? newItem.isSpecial : selectedItem?.isSpecial}
                      onCheckedChange={(checked) => isAddingNew
                        ? handleNewItemChange('isSpecial', checked as boolean)
                        : handleNewItemChange('isSpecial', checked as boolean)
                      }
                    />
                    <Label htmlFor="isSpecial">Special Item</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bestSeller"
                      checked={isAddingNew ? newItem.bestSeller : selectedItem?.bestSeller}
                      onCheckedChange={(checked) => isAddingNew
                        ? handleNewItemChange('bestSeller', checked as boolean)
                        : handleNewItemChange('bestSeller', checked as boolean)
                      }
                    />
                    <Label htmlFor="bestSeller">Best Seller</Label>
                  </div>
                </div>
              </div>
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
    </div>
  );
} 