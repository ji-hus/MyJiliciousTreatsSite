import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuManager } from './MenuManager';
import { InventoryManager } from './InventoryManager';
import { OrderManager } from './OrderManager';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useMenu } from '@/contexts/MenuContext';

const Dashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="menu" className="space-y-6">
        <TabsList>
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <MenuManager />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryManager />
        </TabsContent>

        <TabsContent value="orders">
          <OrderManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard; 