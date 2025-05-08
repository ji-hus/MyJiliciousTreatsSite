import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, MenuItem, initialAllergens } from '@/data/menu-items';
import { useAuth } from '@/contexts/AuthContext';
import { useMenu } from '@/contexts/MenuContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vegan, EggOff, MilkOff, LogOut, Plus, Trash2, Pencil, X, WheatOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FormState extends Omit<MenuItem, 'dietaryInfo'> {
  dietaryInfo: {
    vegan: boolean;
    glutenFree: boolean;
    nutFree: boolean;
    dairyFree: boolean;
  };
}

function useMenuForm(initialState: Partial<FormState>) {
  const [formState, setFormState] = useState<Partial<FormState>>(initialState);
  
  const handleChange = useCallback((field: keyof FormState, value: any) => {
    if (field === 'dietaryInfo') {
      const dietaryInfo = {
        vegan: false,
        glutenFree: false,
        nutFree: false,
        dairyFree: false,
        ...(value as FormState['dietaryInfo'])
      };
      setFormState(prev => ({
        ...prev,
        dietaryInfo
      }));
    } else {
      setFormState(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormState(initialState);
  }, [initialState]);

  return { formState, handleChange, resetForm };
}

const AdminPage = () => {
  const { 
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
  } = useMenu();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');
  const [newAllergen, setNewAllergen] = useState('');
  const [allergens, setAllergens] = useState<string[]>(initialAllergens);

  const initialFormState = useMemo<Partial<FormState>>(() => ({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'Breads',
    dietaryInfo: {
      vegan: false,
      glutenFree: false,
      nutFree: false,
      dairyFree: false
    },
    allergens: {},
    isSpecial: false,
    available: true,
    image: '/images/placeholder.jpg',
    bestSeller: false,
    seasonal: false
  }), []);

  const { formState: newItem, handleChange: handleNewItemChange, resetForm } = useMenuForm(initialFormState);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const [newCategory, setNewCategory] = useState('');

  // Function to get a consistent color for a dietary restriction
  const getDietaryColor = (restriction: string) => {
    const colors = [
      'green',
      'blue',
      'yellow',
      'purple',
      'emerald',
      'indigo',
      'pink',
      'orange',
      'teal',
      'cyan',
      'violet',
      'fuchsia',
      'rose',
      'amber',
      'lime'
    ];
    
    const index = restriction.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Function to format dietary restriction name
  const formatDietaryName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const handleEdit = (id: string, currentStock: number, currentPrice: number) => {
    console.log('Editing item:', id, currentStock, currentPrice);
    setEditingId(id);
    setNewStock(currentStock);
    setNewPrice(currentPrice);
  };

  const handleSave = (id: string) => {
    console.log('Saving updates for item:', id, newStock, newPrice);
    updateMenuItem(id, { 
      stock: newStock,
      price: newPrice,
      madeToOrder: newStock === 0 
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingItem(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddNew = () => {
    const newMenuItem: MenuItem = {
      id: crypto.randomUUID(),
      name: newItem.name || '',
      category: newItem.category || 'Breads',
      description: newItem.description || '',
      price: Number(newItem.price) || 0,
      stock: Number(newItem.stock) || 0,
      madeToOrder: newItem.madeToOrder || false,
      isSpecial: newItem.isSpecial || false,
      dietaryInfo: {
        vegan: newItem.dietaryInfo.vegan,
        glutenFree: newItem.dietaryInfo.glutenFree,
        nutFree: newItem.dietaryInfo.nutFree,
        dairyFree: newItem.dietaryInfo.dairyFree
      },
      allergens: newItem.allergens || {},
      available: newItem.available || true,
      image: newItem.image || '/images/placeholder.jpg',
      bestSeller: false,
      seasonal: false
    };

    addMenuItem(newMenuItem);
    setIsAddingNew(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    console.log('Deleting item:', id);
    deleteMenuItem(id);
  };

  const handleEditItem = (item: MenuItem) => {
    console.log('Editing item:', item);
    setEditingItem(item);
    handleNewItemChange('name', item.name);
    handleNewItemChange('category', item.category);
    handleNewItemChange('description', item.description);
    handleNewItemChange('price', item.price);
    handleNewItemChange('stock', item.stock);
    handleNewItemChange('madeToOrder', item.madeToOrder);
    handleNewItemChange('isSpecial', item.isSpecial);
    handleNewItemChange('dietaryInfo', {
      vegan: item.dietaryInfo.vegan,
      glutenFree: item.dietaryInfo.glutenFree,
      nutFree: item.dietaryInfo.nutFree,
      dairyFree: item.dietaryInfo.dairyFree
    });
    handleNewItemChange('allergens', { ...item.allergens });
    handleNewItemChange('available', item.available);
    handleNewItemChange('image', item.image);
    handleNewItemChange('bestSeller', item.bestSeller);
    handleNewItemChange('seasonal', item.seasonal);
  };

  const handleSaveEdit = (item: MenuItem) => {
    if (!item.name || !item.category || !item.price || !item.description) return;

    const updatedItem: MenuItem = {
      ...item,
      price: Number(item.price),
      stock: Number(item.stock),
      madeToOrder: item.stock === 0,
      dietaryInfo: {
        vegan: item.dietaryInfo.vegan,
        glutenFree: item.dietaryInfo.glutenFree,
        nutFree: item.dietaryInfo.nutFree,
        dairyFree: item.dietaryInfo.dairyFree
      },
      bestSeller: item.bestSeller || false,
      seasonal: item.seasonal || false
    };

    updateMenuItem(item.id, updatedItem);
    setEditingItem(null);
  };

  const handleAddDietaryRestriction = () => {
    if (newDietaryRestriction.trim()) {
      addDietaryRestriction(newDietaryRestriction.trim());
      setNewDietaryRestriction('');
    }
  };

  const handleAddAllergen = () => {
    if (newAllergen.trim() && !allergens.includes(newAllergen.trim())) {
      setAllergens([...allergens, newAllergen.trim()]);
      setNewAllergen('');
    }
  };

  const handleRemoveAllergen = (allergen: string) => {
    setAllergens(allergens.filter(a => a !== allergen));
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    removeCategory(category);
  };

  const renderItemForm = (isEditing = false) => {
    const item = isEditing ? editingItem : newItem;
    if (!item) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={item.name}
              onChange={(e) => {
                if (isEditing && editingItem) {
                  setEditingItem({ ...editingItem, name: e.target.value });
                } else {
                  handleNewItemChange('name', e.target.value);
                }
              }}
              placeholder="Item name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={item.category}
              onValueChange={(value) => {
                if (isEditing && editingItem) {
                  setEditingItem({ ...editingItem, category: value });
                } else {
                  handleNewItemChange('category', value);
                }
              }}
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
            value={item.description}
            onChange={(e) => {
              if (isEditing && editingItem) {
                setEditingItem({ ...editingItem, description: e.target.value });
              } else {
                handleNewItemChange('description', e.target.value);
              }
            }}
            placeholder="Item description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={item.price || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                if (isEditing && editingItem) {
                  setEditingItem({ ...editingItem, price: value });
                } else {
                  handleNewItemChange('price', value);
                }
              }}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Initial Stock</Label>
            <Input
              id="stock"
              type="number"
              value={item.stock || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                if (isEditing && editingItem) {
                  setEditingItem({ 
                    ...editingItem, 
                    stock: value,
                    madeToOrder: value === 0
                  });
                } else {
                  handleNewItemChange('stock', value);
                }
              }}
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Item Status</Label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="madeToOrder"
                checked={item.madeToOrder}
                onCheckedChange={(checked) => {
                  if (isEditing && editingItem) {
                    setEditingItem({
                      ...editingItem,
                      madeToOrder: checked === true
                    });
                  } else {
                    handleNewItemChange('madeToOrder', checked === true);
                  }
                }}
              />
              <Label htmlFor="madeToOrder">Made to Order</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSpecial"
                checked={item.isSpecial}
                onCheckedChange={(checked) => {
                  if (isEditing && editingItem) {
                    setEditingItem({
                      ...editingItem,
                      isSpecial: checked === true
                    });
                  } else {
                    handleNewItemChange('isSpecial', checked === true);
                  }
                }}
              />
              <Label htmlFor="isSpecial">This Week's Special</Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={item.category === category}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (isEditing && editingItem) {
                        setEditingItem({
                          ...editingItem,
                          category: category
                        });
                      } else {
                        handleNewItemChange('category', category);
                      }
                    }
                  }}
                />
                <Label htmlFor={`category-${category}`} className="capitalize">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Dietary Information</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dietaryRestrictions.map(restriction => (
              <div key={restriction} className="flex items-center space-x-2">
                <Checkbox
                  id={`dietary-${restriction}`}
                  checked={item.dietaryInfo?.[restriction] || false}
                  onCheckedChange={(checked) => {
                    const newDietaryInfo = {
                      vegan: item.dietaryInfo?.vegan || false,
                      glutenFree: item.dietaryInfo?.glutenFree || false,
                      nutFree: item.dietaryInfo?.nutFree || false,
                      dairyFree: item.dietaryInfo?.dairyFree || false,
                      [restriction]: checked === true
                    };
                    if (isEditing && editingItem) {
                      setEditingItem({
                        ...editingItem,
                        dietaryInfo: newDietaryInfo
                      });
                    } else {
                      handleNewItemChange('dietaryInfo', newDietaryInfo);
                    }
                  }}
                />
                <Label htmlFor={`dietary-${restriction}`} className="capitalize">
                  {restriction.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Allergen Information</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allergens.map(allergen => (
              <div key={allergen} className="flex items-center space-x-2">
                <Checkbox
                  id={`allergen-${allergen}`}
                  checked={item.allergens?.[allergen] || false}
                  onCheckedChange={(checked) => {
                    const newAllergens = {
                      ...(item.allergens || {}),
                      [allergen]: checked === true
                    };
                    if (isEditing && editingItem) {
                      setEditingItem({
                        ...editingItem,
                        allergens: newAllergens
                      });
                    } else {
                      handleNewItemChange('allergens', newAllergens);
                    }
                  }}
                />
                <Label htmlFor={`allergen-${allergen}`} className="capitalize">
                  {allergen.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (isEditing) {
                setEditingItem(null);
              } else {
                setIsAddingNew(false);
                resetForm();
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (isEditing && editingItem) {
                handleSaveEdit(editingItem);
              } else {
                handleAddNew();
              }
            }}
            className="bg-bakery-brown hover:bg-bakery-light"
          >
            {isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-bakery-brown">
          Menu Management
        </h1>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2 border-bakery-brown text-bakery-brown hover:bg-bakery-brown hover:text-white"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>

      {/* Menu Categories Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-serif">Menu Categories</CardTitle>
          <CardDescription>Manage available categories for menu items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter new category (e.g., Seasonal Items)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAddCategory}
                className="bg-bakery-brown hover:bg-bakery-light"
                disabled={!newCategory.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 text-bakery-brown border-bakery-brown"
                >
                  {category}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-bakery-brown/10"
                    onClick={() => handleRemoveCategory(category)}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-serif">Dietary Restrictions</CardTitle>
          <CardDescription>Manage available dietary restriction tags for menu items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter new dietary restriction (e.g., halal)"
                value={newDietaryRestriction}
                onChange={(e) => setNewDietaryRestriction(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAddDietaryRestriction}
                className="bg-bakery-brown hover:bg-bakery-light"
                disabled={!newDietaryRestriction.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {dietaryRestrictions.map(restriction => (
                <Badge
                  key={restriction}
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 text-bakery-brown border-bakery-brown"
                >
                  {restriction}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-bakery-brown/10"
                    onClick={() => removeDietaryRestriction(restriction)}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allergens Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-serif">Allergens</CardTitle>
          <CardDescription>Manage available allergen tags for menu items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter new allergen (e.g., mustard)"
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAddAllergen}
                className="bg-bakery-brown hover:bg-bakery-light"
                disabled={!newAllergen.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergens.map(allergen => (
                <Badge
                  key={allergen}
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 text-bakery-brown border-bakery-brown"
                >
                  {allergen.replace(/([A-Z])/g, ' $1').trim()}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-bakery-brown/10"
                    onClick={() => handleRemoveAllergen(allergen)}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Item Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-serif">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </CardTitle>
            {!editingItem && (
              <Button
                variant="outline"
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="flex items-center gap-2 border-bakery-brown text-bakery-brown hover:bg-bakery-brown hover:text-white"
              >
                {isAddingNew ? 'Cancel' : (
                  <>
                    <Plus size={16} />
                    Add New Item
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        {(isAddingNew || editingItem) && (
          <CardContent>
            {renderItemForm(!!editingItem)}
          </CardContent>
        )}
      </Card>

      {/* Existing Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-serif">{item.name}</CardTitle>
                  <CardDescription>{item.category}</CardDescription>
                  <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                  {Object.entries(item.allergens).some(([_, value]) => value) && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Contains:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(item.allergens).map(([allergen, present]) => 
                          present && (
                            <Badge key={allergen} variant="outline" className="text-red-600 border-red-600">
                              {allergen.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditItem(item)}
                    className="text-bakery-brown hover:text-bakery-light hover:bg-bakery-brown/10"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex ml-2 gap-1">
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
                    </TooltipProvider>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-base text-gray-600 font-sans">${item.price.toFixed(2)}</p>
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="stock" className="text-sm">Stock:</Label>
                          <Input
                            id="stock"
                            type="number"
                            min="0"
                            value={newStock}
                            onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                            className="w-24"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="price" className="text-sm">Price: $</Label>
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={newPrice}
                            onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleSave(item.id)}
                          className="bg-bakery-brown hover:bg-bakery-light"
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {item.madeToOrder ? (
                        <Badge variant="outline" className="text-bakery-brown border-bakery-brown font-sans text-base">Made to Order</Badge>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className="text-green-600 border-green-600"
                        >
                          {item.stock} in stock
                        </Badge>
                      )}
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item.id, item.stock, item.price)}
                        className="border-bakery-brown text-bakery-brown hover:bg-bakery-brown hover:text-white"
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPage; 