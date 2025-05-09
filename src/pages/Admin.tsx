import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/contexts/MenuContext";
import { useOrder } from "@/contexts/OrderContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MenuManager } from "@/components/MenuManager";
import { ClipboardList, Package, Settings, LogOut, ChevronRight, AlertCircle, BarChart2, Users, TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isToday } from 'date-fns';

const Admin = () => {
  const { isAuthenticated, logout } = useAuth();
  const { menuItems } = useMenu();
  const { orders, getTodayOrders } = useOrder();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate dashboard stats
  const stats = {
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    lowStockItems: menuItems.filter(item => !item.madeToOrder && item.stock < 5).length,
    todaySales: getTodayOrders().length,
    totalRevenue: getTodayOrders().reduce((total, order) => total + order.total, 0)
  };

  // Calculate inventory summary
  const inventorySummary = menuItems.map(item => {
    const todayOrders = getTodayOrders();
    const itemOrders = todayOrders.flatMap(order => [
      ...order.inStockItems.filter(orderItem => orderItem.id === item.id),
      ...order.madeToOrderItems.filter(orderItem => orderItem.id === item.id)
    ]);
    
    const totalOrdered = itemOrders.reduce((sum, orderItem) => sum + orderItem.quantity, 0);
    const stockStatus = item.madeToOrder ? 'Made to Order' : 
      item.stock <= 0 ? 'Out of Stock' :
      item.stock < 5 ? 'Low Stock' : 'In Stock';

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      stock: item.stock,
      madeToOrder: item.madeToOrder,
      stockStatus,
      totalOrdered,
      remainingStock: item.madeToOrder ? 'N/A' : item.stock - totalOrdered
    };
  });

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif font-bold text-bakery-brown">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut size={16} />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Orders awaiting processing
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  Items need attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todaySales}</div>
                <p className="text-xs text-muted-foreground">
                  Orders completed today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Revenue today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Inventory and Order Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Inventory & Order Summary</CardTitle>
              <CardDescription>
                Overview of stock levels and orders for {format(new Date(), 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Status</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Ordered Today</TableHead>
                    <TableHead>Remaining Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventorySummary.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.stockStatus === 'Low Stock' ? 'secondary' :
                          item.stockStatus === 'Out of Stock' ? 'destructive' :
                          item.stockStatus === 'Made to Order' ? 'secondary' :
                          'default'
                        }>
                          {item.stockStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.madeToOrder ? 'N/A' : item.stock}</TableCell>
                      <TableCell>{item.totalOrdered}</TableCell>
                      <TableCell>{item.remainingStock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Management Systems */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/admin/orders">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Order Management
                  </CardTitle>
                  <CardDescription>
                    View and manage customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {stats.pendingOrders} Pending
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/inventory">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Inventory Management
                  </CardTitle>
                  <CardDescription>
                    Track stock levels and manage inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {stats.lowStockItems} Low Stock
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveTab("menu")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Menu Management
                </CardTitle>
                <CardDescription>
                  Update menu items and categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {menuItems.length} Items
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="menu">
          <MenuManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin; 