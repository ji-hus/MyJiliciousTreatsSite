import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Plus, AlertTriangle, History, BarChart2, Settings, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { format, subDays } from 'date-fns';

// Types
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  madeToOrder: boolean;
  price: number;
  lastUpdated: Date;
  minimumStock: number;
  description?: string;
  ingredients?: string[];
  allergens?: string[];
  shelfLife?: number; // in days
  supplier?: string;
  supplierContact?: string;
  reorderPoint: number;
  reorderQuantity: number;
  unit: string;
  cost: number;
  location?: string;
  notes?: string;
  lastOrdered?: Date;
  nextOrderDate?: Date;
  salesHistory: {
    date: Date;
    quantity: number;
  }[];
}

interface StockAlert {
  id: string;
  itemId: string;
  type: 'low-stock' | 'expiring' | 'reorder';
  message: string;
  createdAt: Date;
  resolved: boolean;
}

const InventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const { toast } = useToast();

  // Mock data - replace with actual API call
  useEffect(() => {
    // TODO: Replace with actual API call
    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        name: 'Brown Butter Chocolate Chips Cookie',
        category: 'Cookies',
        stock: 12,
        madeToOrder: false,
        price: 3.5,
        lastUpdated: new Date('2024-03-19'),
        minimumStock: 10,
        description: 'Classic chocolate chip cookie with brown butter',
        ingredients: ['flour', 'butter', 'chocolate chips', 'sugar', 'eggs'],
        allergens: ['gluten', 'dairy', 'eggs'],
        shelfLife: 7,
        supplier: 'Local Bakery Supplies',
        supplierContact: 'supplier@example.com',
        reorderPoint: 15,
        reorderQuantity: 50,
        unit: 'pieces',
        cost: 1.5,
        location: 'Shelf A-1',
        notes: 'Best seller, keep well stocked',
        lastOrdered: new Date('2024-03-01'),
        nextOrderDate: new Date('2024-03-25'),
        salesHistory: [
          { date: new Date('2024-03-19'), quantity: 5 },
          { date: new Date('2024-03-18'), quantity: 8 },
          { date: new Date('2024-03-17'), quantity: 6 }
        ]
      },
      {
        id: '2',
        name: 'Sourdough Rosemary Focaccia',
        category: 'Bread',
        stock: 0,
        madeToOrder: true,
        price: 11,
        lastUpdated: new Date('2024-03-19'),
        minimumStock: 0,
        description: 'Artisan focaccia with fresh rosemary',
        ingredients: ['flour', 'water', 'salt', 'rosemary', 'olive oil'],
        allergens: ['gluten'],
        shelfLife: 3,
        supplier: 'Local Flour Mill',
        supplierContact: 'mill@example.com',
        reorderPoint: 5,
        reorderQuantity: 20,
        unit: 'loaves',
        cost: 4,
        location: 'Bread Shelf',
        notes: 'Made fresh daily',
        salesHistory: [
          { date: new Date('2024-03-19'), quantity: 3 },
          { date: new Date('2024-03-18'), quantity: 4 },
          { date: new Date('2024-03-17'), quantity: 2 }
        ]
      }
    ];
    setInventory(mockInventory);

    // Generate stock alerts
    const alerts: StockAlert[] = [];
    mockInventory.forEach(item => {
      if (!item.madeToOrder && item.stock < item.minimumStock) {
        alerts.push({
          id: `alert-${item.id}`,
          itemId: item.id,
          type: 'low-stock',
          message: `${item.name} is running low on stock (${item.stock} remaining)`,
          createdAt: new Date(),
          resolved: false
        });
      }
      if (item.nextOrderDate && item.nextOrderDate <= new Date()) {
        alerts.push({
          id: `reorder-${item.id}`,
          itemId: item.id,
          type: 'reorder',
          message: `Time to reorder ${item.name}`,
          createdAt: new Date(),
          resolved: false
        });
      }
    });
    setStockAlerts(alerts);
  }, []);

  const categories = ['all', ...new Set(inventory.map(item => item.category))];

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStockUpdate = async (itemId: string, newStock: number) => {
    try {
      // TODO: Replace with actual API call
      setInventory(inventory.map(item => 
        item.id === itemId ? { 
          ...item, 
          stock: newStock, 
          lastUpdated: new Date(),
          salesHistory: [
            ...item.salesHistory,
            { date: new Date(), quantity: item.stock - newStock }
          ]
        } : item
      ));
      toast({
        title: "Stock updated",
        description: `Stock level updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock level",
        variant: "destructive"
      });
    }
  };

  const handleReorder = async (itemId: string) => {
    try {
      // TODO: Replace with actual API call
      setInventory(inventory.map(item => 
        item.id === itemId ? { 
          ...item, 
          lastOrdered: new Date(),
          nextOrderDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        } : item
      ));
      toast({
        title: "Reorder placed",
        description: "Reorder has been placed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place reorder",
        variant: "destructive"
      });
    }
  };

  const exportInventory = () => {
    // TODO: Implement inventory export functionality
    toast({
      title: "Export started",
      description: "Your inventory report is being generated",
    });
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.madeToOrder) return 'made-to-order';
    if (item.stock <= 0) return 'out-of-stock';
    if (item.stock < item.minimumStock) return 'low-stock';
    if (item.stock < item.reorderPoint) return 'reorder-point';
    return 'in-stock';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'default';
      case 'low-stock':
        return 'secondary';
      case 'out-of-stock':
        return 'destructive';
      case 'reorder-point':
        return 'secondary';
      case 'made-to-order':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const calculateDailyAverage = (item: InventoryItem) => {
    const last7Days = item.salesHistory.filter(sale => 
      sale.date >= subDays(new Date(), 7)
    );
    if (last7Days.length === 0) return 0;
    const total = last7Days.reduce((sum, sale) => sum + sale.quantity, 0);
    return total / last7Days.length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif font-bold text-bakery-brown">Inventory Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportInventory} className="flex items-center gap-2">
            <Download size={16} />
            Export Report
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <div className="mb-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle size={20} />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stockAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between">
                    <p>{alert.message}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReorder(alert.itemId)}
                    >
                      Reorder
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search inventory by name, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Daily Average</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.stock}
                      onChange={(e) => handleStockUpdate(item.id, parseInt(e.target.value))}
                      className="w-20"
                      disabled={item.madeToOrder}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStockStatusColor(getStockStatus(item))}>
                      {getStockStatus(item).split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.location || 'N/A'}</TableCell>
                  <TableCell>{calculateDailyAverage(item).toFixed(1)} {item.unit}/day</TableCell>
                  <TableCell>{format(item.lastUpdated, 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsHistoryDialogOpen(true);
                              }}
                            >
                              <History size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View History</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Item</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReorder(item.id)}
                            >
                              <BarChart2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reorder</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inventory
                .filter(item => !item.madeToOrder && item.stock < item.minimumStock)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <Badge variant="secondary">
                      {item.stock} {item.unit} remaining
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Made to Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inventory
                .filter(item => item.madeToOrder)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <Badge variant="secondary">Made to Order</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reorder Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inventory
                .filter(item => !item.madeToOrder && item.stock < item.reorderPoint)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <Badge variant="secondary">
                      Reorder at {item.reorderPoint} {item.unit}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update item details and settings
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* Add edit form here */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Item History</DialogTitle>
            <DialogDescription>
              View sales history and stock changes
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* Add history view here */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a new item to inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add new item form here */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement; 