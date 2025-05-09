import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  customizations?: string[];
}

export interface Order {
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
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'zelle' | 'cash';
  orderType: 'pickup';
  estimatedCompletionTime?: Date;
  actualCompletionTime?: Date;
  priority: 'normal' | 'high' | 'urgent';
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus' | 'priority'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateOrderNote: (orderId: string, note: string) => Promise<void>;
  updatePaymentStatus: (orderId: string, paymentMethod: Order['paymentMethod'] | 'refunded') => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getOrder: (orderId: string) => Order | undefined;
  getPendingOrders: () => Order[];
  getTodayOrders: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  // Load orders and last order number from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const getNextOrderNumber = () => {
    const savedLastNumber = localStorage.getItem('lastOrderNumber');
    const lastNumber = savedLastNumber ? parseInt(savedLastNumber, 10) : 0;
    const nextNumber = lastNumber + 1;
    localStorage.setItem('lastOrderNumber', nextNumber.toString());
    return nextNumber;
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus' | 'priority'>) => {
    const orderNumber = getNextOrderNumber();
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${orderNumber}`,
      createdAt: new Date(),
      status: 'pending',
      paymentStatus: 'pending',
      priority: 'normal',
      notes: 'Pending payment'
    };

    setOrders(prevOrders => [...prevOrders, newOrder]);
    toast({
      title: "Order received",
      description: `Order #${orderNumber} has been added to the system.`,
    });
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              status,
              actualCompletionTime: status === 'completed' ? new Date() : order.actualCompletionTime,
            }
          : order
      )
    );
    toast({
      title: "Status updated",
      description: `Order #${orderId} status changed to ${status}`,
    });
  };

  const updateOrderNote = async (orderId: string, note: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, notes: note } : order
      )
    );
    toast({
      title: "Note updated",
      description: `Note has been updated for order #${orderId}`,
    });
  };

  const updatePaymentStatus = async (orderId: string, paymentMethod: Order['paymentMethod'] | 'refunded') => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              paymentMethod: paymentMethod === 'refunded' ? order.paymentMethod : paymentMethod,
              paymentStatus: paymentMethod === 'refunded' ? 'refunded' : 'paid',
            }
          : order
      )
    );
    toast({
      title: "Payment updated",
      description: paymentMethod === 'refunded'
        ? `Order #${orderId} has been refunded`
        : `Order #${orderId} payment method set to ${paymentMethod}`,
    });
  };

  const deleteOrder = async (orderId: string) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    toast({
      title: "Order deleted",
      description: `Order #${orderId} has been deleted`,
      variant: "destructive"
    });
  };

  const getOrder = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending');
  };

  const getTodayOrders = () => {
    const today = new Date();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      );
    });
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        updateOrderNote,
        updatePaymentStatus,
        deleteOrder,
        getOrder,
        getPendingOrders,
        getTodayOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
} 