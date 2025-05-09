import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isToday, isTomorrow, isPast, isFuture, isValid } from 'date-fns';
import { Calendar, Search, Filter, Download, Printer, Eye, MessageSquare, Clock, AlertCircle, Trash2, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrder } from '@/contexts/OrderContext';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

// Types
interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  inStockItems: OrderItem[];
  madeToOrderItems: OrderItem[];
  inStockPickupDate?: Date;
  inStockPickupTime?: string;
  madeToOrderPickupDate?: Date;
  madeToOrderPickupTime?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'preparing' | 'ready';
  total: number;
  createdAt: Date;
  specialInstructions?: string;
  notes?: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod?: 'cash' | 'zelle';
  orderType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryInstructions?: string;
  estimatedCompletionTime?: Date;
  actualCompletionTime?: Date;
  priority: 'normal' | 'high' | 'urgent';
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  customizations?: string[];
}

const OrderManagement = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [note, setNote] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { orders, updateOrderStatus, updateOrderNote, deleteOrder } = useOrder();
  const navigate = useNavigate();

  const formatDate = (date: Date | undefined | string) => {
    if (!date) return 'Not set';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isValid(dateObj) ? format(dateObj, 'MMM d, yyyy h:mm a') : 'Invalid date';
  };

  const formatPickupDate = (date: Date | undefined | string) => {
    if (!date) return 'Not set';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isValid(dateObj) ? format(dateObj, 'MMM d, yyyy') : 'Invalid date';
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.includes(searchQuery);
    
    let matchesDate = true;
    if (selectedDate === 'today') {
      const inStockDate = order.inStockPickupDate ? new Date(order.inStockPickupDate) : null;
      const madeToOrderDate = order.madeToOrderPickupDate ? new Date(order.madeToOrderPickupDate) : null;
      matchesDate = (inStockDate && isToday(inStockDate)) || (madeToOrderDate && isToday(madeToOrderDate));
    } else if (selectedDate === 'tomorrow') {
      const inStockDate = order.inStockPickupDate ? new Date(order.inStockPickupDate) : null;
      const madeToOrderDate = order.madeToOrderPickupDate ? new Date(order.madeToOrderPickupDate) : null;
      matchesDate = (inStockDate && isTomorrow(inStockDate)) || (madeToOrderDate && isTomorrow(madeToOrderDate));
    } else if (selectedDate === 'past') {
      const inStockDate = order.inStockPickupDate ? new Date(order.inStockPickupDate) : null;
      const madeToOrderDate = order.madeToOrderPickupDate ? new Date(order.madeToOrderPickupDate) : null;
      matchesDate = (inStockDate && isPast(inStockDate)) || (madeToOrderDate && isPast(madeToOrderDate));
    } else if (selectedDate === 'future') {
      const inStockDate = order.inStockPickupDate ? new Date(order.inStockPickupDate) : null;
      const madeToOrderDate = order.madeToOrderPickupDate ? new Date(order.madeToOrderPickupDate) : null;
      matchesDate = (inStockDate && isFuture(inStockDate)) || (madeToOrderDate && isFuture(madeToOrderDate));
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handleAddNote = async (orderId: string) => {
    try {
      await updateOrderNote(orderId, note);
      setIsNoteDialogOpen(false);
      setNote('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
    }
  };

  const handlePaymentStatusChange = async (orderId: string, paymentMethod: 'zelle' | 'cash' | 'refunded' | 'payment_option') => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      if (paymentMethod === 'refunded') {
        await updateOrderStatus(orderId, 'cancelled');
        await updateOrderNote(orderId, `Payment was refunded - Previous payment was made via ${order.paymentMethod}`);
      } else if (paymentMethod === 'payment_option') {
        await updateOrderStatus(orderId, 'pending');
        await updateOrderNote(orderId, 'Pending');
      } else {
        await updateOrderStatus(orderId, 'preparing');
        await updateOrderNote(orderId, `Payment received via ${paymentMethod}`);
      }
      
      toast({
        title: "Payment updated",
        description: paymentMethod === 'refunded' 
          ? `Order #${orderId} has been refunded`
          : paymentMethod === 'payment_option'
          ? `Order #${orderId} payment status reset to pending`
          : `Order #${orderId} payment method set to ${paymentMethod}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      setOrderToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive"
      });
    }
  };

  const exportOrders = () => {
    // TODO: Implement order export functionality
    toast({
      title: "Export started",
      description: "Your orders are being exported",
    });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'preparing':
        return 'secondary';
      case 'ready':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: Order['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'refunded':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/admin')}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-4xl font-serif font-bold text-bakery-brown">Order Management</h1>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="future">Future</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={exportOrders}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map(order => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Order #{order.id}
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    {order.priority !== 'normal' && (
                      <Badge variant={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Customer: {order.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Contact: {order.customerEmail} | {order.customerPhone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created: {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View Details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNote(order.notes || '');
                            setIsNoteDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add Note</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setOrderToDelete(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Order</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {order.paymentStatus === 'pending' && (
                    <Select
                      value={order.paymentMethod || 'payment_option'}
                      onValueChange={(value: 'zelle' | 'cash' | 'refunded' | 'payment_option') => handlePaymentStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select payment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="payment_option">Payment Option</SelectItem>
                        <SelectItem value="zelle">Zelle</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="refunded" className="text-red-600">Refund</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Select
                    value={order.status}
                    onValueChange={(value: Order['status']) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Order Details</h3>
                  {order.inStockItems.length > 0 && (
                    <div className="mb-4">
                      <p className="font-medium">In-Stock Items:</p>
                      <ul className="list-disc list-inside">
                        {order.inStockItems.map(item => (
                          <li key={item.id}>
                            {item.name} x{item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                            {item.specialInstructions && (
                              <span className="text-sm text-gray-600 ml-2">
                                ({item.specialInstructions})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-600 mt-1">
                        Pickup: {formatPickupDate(order.inStockPickupDate)} at {order.inStockPickupTime || 'Not set'}
                      </p>
                    </div>
                  )}
                  {order.madeToOrderItems.length > 0 && (
                    <div>
                      <p className="font-medium">Made-to-Order Items:</p>
                      <ul className="list-disc list-inside">
                        {order.madeToOrderItems.map(item => (
                          <li key={item.id}>
                            {item.name} x{item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                            {item.specialInstructions && (
                              <span className="text-sm text-gray-600 ml-2">
                                ({item.specialInstructions})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-600 mt-1">
                        Pickup: {formatPickupDate(order.madeToOrderPickupDate)} at {order.madeToOrderPickupTime || 'Not set'}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Additional Information</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Total:</span> ${order.total.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Payment Status:</span>{' '}
                      <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </p>
                    {order.paymentStatus === 'paid' && (
                      <p>
                        <span className="font-medium">Payment Method:</span>{' '}
                        <Badge variant="outline">
                          {order.paymentMethod}
                        </Badge>
                      </p>
                    )}
                    {order.specialInstructions && (
                      <p>
                        <span className="font-medium">Special Instructions:</span>{' '}
                        {order.specialInstructions}
                      </p>
                    )}
                    {order.notes && (
                      <p>
                        <span className="font-medium">Notes:</span> {order.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Detailed view of order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Add detailed order view here */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note to Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Add a note or update existing notes for this order
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter your note here..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleAddNote(selectedOrder!.id)}>
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete order #{orderToDelete} and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => orderToDelete && handleDeleteOrder(orderToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderManagement; 