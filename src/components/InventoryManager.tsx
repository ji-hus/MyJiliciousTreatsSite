import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, AlertTriangle, TrendingUp, TrendingDown, Package, History } from "lucide-react";
import { DateRange } from "react-day-picker";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  is_made_to_order: boolean;
  is_available: boolean;
  dietary_info: {
    vegan: boolean;
    gluten_free: boolean;
    nut_free: boolean;
    dairy_free: boolean;
  };
  allergens: string[];
  image_url: string;
  preparation_time: number;
  best_seller: boolean;
  seasonal: boolean;
  season_start?: string;
  season_end?: string;
  nutritional_info?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface InventoryLog {
  id: number;
  menu_item_id: number;
  quantity_change: number;
  reason: string;
  timestamp: string;
  menu_item: MenuItem;
}

interface InventoryAnalytics {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  madeToOrderItems: number;
  totalValue: number;
  recentChanges: InventoryLog[];
}

interface InventoryManagerProps {
  onUpdate: () => void;
  menuItems: MenuItem[];
}

export function InventoryManager({ onUpdate, menuItems: initialMenuItems }: InventoryManagerProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [lowStockItems, setLowStockItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [newStock, setNewStock] = useState('');
  const [reason, setReason] = useState('');
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalytics>({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    madeToOrderItems: 0,
    totalValue: 0,
    recentChanges: []
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });

  useEffect(() => {
    setMenuItems(initialMenuItems);
    fetchLowStockItems();
    fetchInventoryLogs();
    calculateAnalytics();
  }, [initialMenuItems]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/menu');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/inventory/low-stock');
      const data = await response.json();
      setLowStockItems(data);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    }
  };

  const fetchInventoryLogs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/inventory/logs');
      const data = await response.json();
      setInventoryLogs(data);
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
    }
  };

  const calculateAnalytics = () => {
    const analytics = {
      totalItems: menuItems.length,
      lowStockItems: lowStockItems.length,
      outOfStockItems: menuItems.filter(item => item.stock === 0).length,
      madeToOrderItems: menuItems.filter(item => item.is_made_to_order).length,
      totalValue: menuItems.reduce((sum, item) => sum + (item.stock * item.price), 0),
      recentChanges: inventoryLogs.slice(0, 5)
    };
    setAnalytics(analytics);
  };

  const updateStock = async (itemId: number, newStockValue: number) => {
    try {
      await fetch(`http://localhost:3001/api/inventory/stock/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStockValue })
      });

      await fetch('http://localhost:3001/api/inventory/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_item_id: itemId,
          quantity_change: newStockValue - (selectedItem?.stock || 0),
          reason: reason || 'Manual stock update'
        })
      });

      onUpdate();
      setSelectedItem(null);
      setNewStock('');
      setReason('');
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.lowStockItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Made to Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.madeToOrderItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Stock Alert!</AlertTitle>
          <AlertDescription>
            The following items are running low:
            {lowStockItems.map(item => ` ${item.name} (${item.stock})`).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="history">Inventory History</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Made to Order</TableHead>
                    <TableHead>Prep Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>{item.is_made_to_order ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{item.preparation_time} mins</TableCell>
                      <TableCell>
                        <Badge variant={item.is_available ? "default" : "destructive"}>
                          {item.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedItem(item)}
                        >
                          Update Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Inventory History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick date range"
                      )}
                      <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.timestamp), "PPp")}</TableCell>
                      <TableCell>{log.menu_item.name}</TableCell>
                      <TableCell>
                        <Badge variant={log.quantity_change > 0 ? "default" : "destructive"}>
                          {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Update Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock: {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>New Stock Amount</Label>
              <Input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Enter new stock amount"
              />
            </div>
            <div className="grid gap-2">
              <Label>Reason for Update</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for stock update"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedItem && updateStock(selectedItem.id, parseInt(newStock))}
              disabled={!newStock}
            >
              Update Stock
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 