import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  is_made_to_order: boolean;
}

interface Order {
  id: number;
  customer_name: string;
  items: {
    menu_item_id: number;
    quantity: number;
    menu_item: MenuItem;
  }[];
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
}

interface OrderManagerProps {
  onUpdate: () => void;
  menuItems: MenuItem[];
  orders: Order[];
}

export function OrderManager({ onUpdate, menuItems, orders: initialOrders }: OrderManagerProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: Order['status']): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'preparing':
        return 'secondary';
      case 'ready':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>

      <Card>
        <CardHeader>
          <CardTitle>Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>
                    {order.items.map(item => (
                      <div key={item.menu_item_id}>
                        {item.quantity}x {item.menu_item.name}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "PPp")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value: Order['status']) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 