import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuItems, categories } from '@/data/menu-items';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Calendar as CalendarIcon, X, Plus, Minus, Vegan, EggOff, MilkOff, WheatOff } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import emailjs from '@emailjs/browser';
import { orderEmailTemplate } from '@/email-templates';
import { useMenu } from '@/contexts/MenuContext';

// Initialize EmailJS
emailjs.init("jRgg2OkLA0U1pS4WQ");

// Define form schema
const orderFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).refine(val => val.trim().length > 0, {
    message: 'Name is required'
  }),
  email: z.string().email({ message: 'Please enter a valid email address' }).refine(val => val.trim().length > 0, {
    message: 'Email is required'
  }),
  phone: z.string()
    .min(12, { message: 'Please enter a valid phone number (xxx-xxx-xxxx)' })
    .max(12, { message: 'Please enter a valid phone number (xxx-xxx-xxxx)' })
    .refine(val => val.trim().length > 0, {
      message: 'Phone number is required'
    })
    .refine(val => /^\d{3}-\d{3}-\d{4}$/.test(val), {
      message: 'Please enter a valid phone number (xxx-xxx-xxxx)'
    }),
  inStockPickupDate: z.date({
    required_error: "Please select a pickup date for in-stock items",
  }),
  inStockPickupTime: z.string({
    required_error: "Please select a pickup time for in-stock items",
  }),
  madeToOrderPickupDate: z.date({
    required_error: "Please select a pickup date for made-to-order items",
  }),
  madeToOrderPickupTime: z.string({
    required_error: "Please select a pickup time for made-to-order items",
  }),
  specialInstructions: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

// Initial values for the form
const defaultValues: Partial<OrderFormValues> = {
  name: '',
  email: '',
  phone: '',
  inStockPickupDate: undefined,
  inStockPickupTime: undefined,
  madeToOrderPickupDate: undefined,
  madeToOrderPickupTime: undefined,
  specialInstructions: '',
};

// Type for cart items
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Dietary restrictions for filtering
const dietaryOptions = [
  { id: "vegan", label: "Vegan", icon: <Vegan className="mr-1.5" /> },
  { id: "glutenFree", label: "Gluten Free", icon: <WheatOff className="mr-1.5" /> },
  { id: "dairyFree", label: "Dairy Free", icon: <MilkOff className="mr-1.5" /> },
  { id: "nutFree", label: "Nut Free", icon: <EggOff className="mr-1.5" /> },
  { id: "halal", label: "Halal", icon: <img src="/images/halalwhite.jpg" alt="Halal" className="w-4 h-4 mr-1.5" /> }
];

const OrderPage = () => {
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const { toast } = useToast();
  const { menuItems } = useMenu();

  // Split cart items into in-stock and made-to-order
  const inStockItems = cart.filter(item => {
    const menuItem = menuItems.find(mi => mi.id === item.id);
    return menuItem && !menuItem.madeToOrder;
  });

  const madeToOrderItems = cart.filter(item => {
    const menuItem = menuItems.find(mi => mi.id === item.id);
    return menuItem && menuItem.madeToOrder;
  });

  // Create validation schema with access to cart items
  const createValidationSchema = () => {
    return orderFormSchema.refine((data) => {
      // First check if cart is empty
      if (cart.length === 0) {
        return false;
      }

      // If there are in-stock items, require in-stock pickup details
      if (inStockItems.length > 0) {
        if (!data.inStockPickupDate || !data.inStockPickupTime) {
          return false;
        }
      }
      // If there are made-to-order items, require made-to-order pickup details
      if (madeToOrderItems.length > 0) {
        if (!data.madeToOrderPickupDate || !data.madeToOrderPickupTime) {
          return false;
        }
      }
      return true;
    }, {
      message: cart.length === 0 
        ? "Please add items to your cart before submitting your order" 
        : "Please select pickup date and time for all items",
      path: ["inStockPickupDate", "madeToOrderPickupDate"]
    });
  };

  // Create form with dynamic validation
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(createValidationSchema()),
    defaultValues,
    mode: "onChange"
  });

  // Get the item ID from URL search params and add to cart if it exists
  useEffect(() => {
    const itemId = searchParams.get('item');
    if (itemId) {
      const menuItem = menuItems.find(item => item.id === itemId);
      if (menuItem && !cart.some(item => item.id === itemId)) {
        setCart(prevCart => [...prevCart, {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }]);
      }
    }
  }, [searchParams, cart]);

  // Filter menu items based on selected category and dietary restrictions
  const filteredMenuItems = menuItems.filter(item => {
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    // Filter by dietary restrictions if any are selected
    const matchesDietary = selectedDietary.length === 0 || selectedDietary.every(restriction => 
      item.dietaryInfo[restriction as keyof typeof item.dietaryInfo]
    );
    
    return matchesCategory && matchesDietary;
  });

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Determine if order contains made-to-order items
  const hasMadeToOrderItems = madeToOrderItems.length > 0;

  // Get available pickup dates based on order type
  const getAvailablePickupDates = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // If order contains made-to-order items
    if (hasMadeToOrderItems) {
      // First, ensure we're only allowing Saturdays
      if (date.getDay() !== 6) {
        return false;
      }

      // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
      const currentDay = now.getDay();
      const currentHour = now.getHours();

      // Calculate the date of the upcoming Saturday
      const daysUntilNextSaturday = (6 - currentDay + 7) % 7;
      const upcomingSaturday = new Date(today);
      upcomingSaturday.setDate(today.getDate() + daysUntilNextSaturday);

      // Calculate the date of the Saturday after next
      const saturdayAfterNext = new Date(upcomingSaturday);
      saturdayAfterNext.setDate(upcomingSaturday.getDate() + 7);

      // If we're past Wednesday (Thursday, Friday, Saturday, Sunday) or it's Wednesday after 6 PM
      if (currentDay > 3 || (currentDay === 3 && currentHour >= 18)) {
        // Only allow dates on or after the Saturday after next
        return date >= saturdayAfterNext;
      } else {
        // Before Wednesday 6 PM, allow the upcoming Saturday
        return date >= upcomingSaturday;
      }
    } else {
      // For in-stock items only
      const isWeekday = date.getDay() >= 1 && date.getDay() <= 5; // Monday through Friday
      const minPickupDate = new Date(today);
      minPickupDate.setDate(today.getDate() + 1); // Next day pickup
      
      return isWeekday && date >= minPickupDate;
    }
  };

  // Get available pickup times based on order type
  const getAvailablePickupTimes = () => {
    if (hasMadeToOrderItems) {
      // For made-to-order items, available all day
      return [
        "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
        "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
        "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
        "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
        "5:00 PM", "5:30 PM", "6:00 PM"
      ];
    } else {
      // For in-stock items, noon to 6 PM
      return [
        "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
        "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
        "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
        "6:00 PM"
      ];
    }
  };

  // Handle adding item to cart
  const addToCart = (item: typeof menuItems[0]) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    // Check if item is made to order or has stock available
    if (!item.madeToOrder && item.stock <= 0) {
      toast({
        title: "Out of stock",
        description: `${item.name} is currently out of stock.`,
        variant: "destructive"
      });
      return;
    }

    // Check if adding one more would exceed stock
    if (!item.madeToOrder && existingItem && existingItem.quantity >= item.stock) {
      toast({
        title: "Stock limit reached",
        description: `Only ${item.stock} ${item.name} available.`,
        variant: "destructive"
      });
      return;
    }
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }]);
    }

    toast({
      title: "Item added to cart",
      description: `${item.name} has been added to your order.`,
    });
  };

  // Handle removing item from cart
  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }

    const menuItem = menuItems.find(item => item.id === id);
    if (!menuItem?.madeToOrder && quantity > menuItem!.stock) {
      toast({
        title: "Stock limit reached",
        description: `Only ${menuItem!.stock} ${menuItem!.name} available.`,
        variant: "destructive"
      });
      return;
    }

    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  // Handle dietary filter toggle
  const handleDietaryToggle = (value: string[]) => {
    setSelectedDietary(value);
  };

  // Format phone number helper function
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formattedValue = '';
    if (digits.length > 0) {
      formattedValue = digits.slice(0, 3);
      if (digits.length > 3) {
        formattedValue += '-' + digits.slice(3, 6);
      }
      if (digits.length > 6) {
        formattedValue += '-' + digits.slice(6, 10);
      }
    }
    return formattedValue;
  };

  // Handle form submission
  const onSubmit = async (data: OrderFormValues) => {
    console.log('Form submitted with data:', data);
    console.log('Cart items:', cart);

    // Basic validation
    if (cart.length === 0) {
      console.log('Cart is empty');
      return;
    }

    if (!data.name || !data.email || !data.phone) {
      console.log('Missing required fields');
      return;
    }

    if (inStockItems.length > 0 && (!data.inStockPickupDate || !data.inStockPickupTime)) {
      console.log('Missing in-stock pickup details');
      return;
    }

    if (madeToOrderItems.length > 0 && (!data.madeToOrderPickupDate || !data.madeToOrderPickupTime)) {
      console.log('Missing made-to-order pickup details');
      return;
    }

    try {
      console.log('Starting email send process');
      
      // Prepare email template parameters
      const templateParams = {
        to_email: 'myjilicioustreats@gmail.com',
        from_name: data.name,
        from_email: data.email,
        phone: data.phone,
        in_stock_pickup_date: data.inStockPickupDate ? format(data.inStockPickupDate, 'MMMM d, yyyy') : '',
        in_stock_pickup_time: data.inStockPickupTime || '',
        made_to_order_pickup_date: data.madeToOrderPickupDate ? format(data.madeToOrderPickupDate, 'MMMM d, yyyy') : '',
        made_to_order_pickup_time: data.madeToOrderPickupTime || '',
        special_instructions: data.specialInstructions || '',
        in_stock_items: inStockItems.map(item => 
          `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n'),
        made_to_order_items: madeToOrderItems.map(item => 
          `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n'),
        total_amount: `$${cartTotal.toFixed(2)}`,
        message: orderEmailTemplate,
        reply_to: data.email
      };

      console.log('Sending email with parameters:', templateParams);

      // Send email using EmailJS with explicit configuration
      const result = await emailjs.send(
        'service_10tkiq3',
        'template_34tuje7',
        templateParams,
        {
          publicKey: 'jRgg2OkLA0U1pS4WQ'
        }
      );

      console.log('EmailJS Response:', result);

      // Check if the email was sent successfully
      if (result.text === 'OK') {
        // Create pickup message based on available dates
        let pickupMessage = '';
        if (data.inStockPickupDate && data.inStockPickupTime) {
          pickupMessage += `We'll see you on ${format(data.inStockPickupDate, 'MMMM d, yyyy')} at ${data.inStockPickupTime} for in-stock items`;
        }
        if (data.madeToOrderPickupDate && data.madeToOrderPickupTime) {
          if (pickupMessage) pickupMessage += ' and ';
          pickupMessage += `on ${format(data.madeToOrderPickupDate, 'MMMM d, yyyy')} at ${data.madeToOrderPickupTime} for made-to-order items`;
        }

        toast({
          title: "Order received!",
          description: `Thank you for your order. ${pickupMessage}.`,
        });

        // Reset form and cart
        form.reset(defaultValues);
        setCart([]);
      } else {
        throw new Error('Email service returned unexpected response');
      }
    } catch (error) {
      console.error('Error sending order:', error);
      // Log more detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      // Check if it's an EmailJS error
      if (error && typeof error === 'object' && 'text' in error) {
        console.error('EmailJS error:', error.text);
      }
      toast({
        title: "Error",
        description: "There was a problem submitting your order. Please try again or contact us directly.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-bakery-brown text-center mb-4">
        Place Your Pre-Order
      </h1>
      <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-12 font-sans">
        Order your freshly baked goods ahead of time for pickup at our location.
      </p>

      {/* Order Deadline Notice */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-bakery-gold/10 border border-bakery-gold/30 rounded-lg p-6 text-center">
          <h2 className="text-xl font-serif font-semibold text-bakery-brown mb-2">
            Important Order Information
          </h2>
          <p className="text-lg text-gray-700 font-sans">
            Orders close Wednesday by 6pm for Saturday pickup.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Select Items</CardTitle>
              <CardDescription className="text-lg font-sans">Browse our menu and add items to your order</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category filter */}
              <div className="mb-6">
                <h3 className="font-serif font-medium text-base mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className={selectedCategory === 'all' ? 'bg-bakery-brown hover:bg-bakery-light font-sans text-lg' : 'border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10 font-sans text-lg'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className={selectedCategory === category ? 'bg-bakery-brown hover:bg-bakery-light font-sans text-lg' : 'border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10 font-sans text-lg'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Dietary restrictions filter */}
              <div className="mb-6">
                <h3 className="font-serif font-medium text-base mb-2">Dietary Preferences</h3>
                <ToggleGroup 
                  type="multiple" 
                  variant="outline" 
                  className="flex flex-wrap gap-2"
                  value={selectedDietary} 
                  onValueChange={handleDietaryToggle}
                >
                  {dietaryOptions.map(option => (
                    <ToggleGroupItem 
                      key={option.id} 
                      value={option.id} 
                      aria-label={option.label}
                      className="flex items-center border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10 data-[state=on]:bg-bakery-brown data-[state=on]:text-white font-sans text-lg"
                    >
                      {option.icon}
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Menu items */}
              <div className="max-h-[400px] overflow-y-auto">
                {filteredMenuItems.length === 0 ? (
                  <div className="text-center p-8 text-gray-500 font-sans text-lg">
                    No items match your selected filters.
                  </div>
                ) : (
                  categories
                    .filter(category => 
                      selectedCategory === 'all' || category === selectedCategory
                    )
                    .map(category => {
                      const categoryItems = filteredMenuItems.filter(item => item.category === category);
                      if (categoryItems.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-8">
                          <h3 className="font-serif font-semibold text-lg mb-3">{category}</h3>
                          <div className="space-y-3">
                            {categoryItems.map(item => (
                              <div key={item.id} className="flex justify-between items-center p-3 rounded-md bg-bakery-cream/20 hover:bg-bakery-cream/40">
                                <div>
                                  <div className="flex items-center">
                                    <p className="font-medium font-sans text-lg">{item.name}</p>
                                    <div className="flex ml-2 gap-1">
                                      {item.dietaryInfo.vegan && (
                                        <span title="Vegan - Contains no animal products"><Vegan size={16} className="text-green-600" /></span>
                                      )}
                                      {item.dietaryInfo.glutenFree && (
                                        <span title="Gluten Free - No wheat, rye, or barley"><WheatOff size={16} className="text-yellow-600" /></span>
                                      )}
                                      {item.dietaryInfo.nutFree && (
                                        <span title="Nut Free - No nuts or nut products"><EggOff size={16} className="text-yellow-600" /></span>
                                      )}
                                      {item.dietaryInfo.dairyFree && (
                                        <span title="Dairy Free - No milk or dairy products"><MilkOff size={16} className="text-blue-600" /></span>
                                      )}
                                      {item.dietaryInfo.halal && (
                                        <span title="Halal - Prepared according to Islamic dietary laws">
                                          <img src="/images/halalwhite.jpg" alt="Halal" className="w-4 h-4" />
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-base text-gray-600 font-sans">${item.price.toFixed(2)}</p>
                                    {item.madeToOrder ? (
                                      <Badge variant="outline" className="text-bakery-brown border-bakery-brown font-sans text-base">Made to Order</Badge>
                                    ) : item.stock > 0 ? (
                                      <Badge variant="outline" className="text-green-600 border-green-600 font-sans text-base">{item.stock} in stock</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-red-600 border-red-600 font-sans text-base">Out of stock</Badge>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => addToCart(item)}
                                  variant="outline" 
                                  size="sm"
                                  className="border-bakery-brown text-bakery-brown hover:bg-bakery-brown hover:text-white font-sans text-lg"
                                  disabled={!item.madeToOrder && item.stock === 0}
                                >
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
              
              {/* Legend for dietary icons */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-base font-medium mb-2 font-sans">Dietary Information:</h4>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <div className="flex items-center font-sans">
                    <Vegan size={14} className="text-green-600 mr-1.5" /> Vegan
                  </div>
                  <div className="flex items-center font-sans">
                    <WheatOff size={14} className="text-yellow-600 mr-1.5" /> Gluten Free
                  </div>
                  <div className="flex items-center font-sans">
                    <MilkOff size={14} className="text-blue-600 mr-1.5" /> Dairy Free
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Form and Cart */}
        <div className="lg:col-span-2">
          <div className="grid gap-8">
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Your Order</CardTitle>
                <CardDescription className="text-lg font-sans">Review your selected items</CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 font-sans text-lg">
                    Your cart is empty. Add items from the menu to get started.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {inStockItems.length > 0 && (
                      <div>
                        <h3 className="font-medium text-lg mb-3 text-bakery-brown">In-Stock Items</h3>
                        <div className="space-y-4">
                          {inStockItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-4 rounded-md bg-white border">
                              <div>
                                <p className="font-medium font-sans text-lg">{item.name}</p>
                                <p className="text-base text-gray-600 font-sans">${item.price.toFixed(2)} each</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-sans text-lg">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {madeToOrderItems.length > 0 && (
                      <div>
                        <h3 className="font-medium text-lg mb-3 text-bakery-brown">Made-to-Order Items</h3>
                        <div className="space-y-4">
                          {madeToOrderItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-4 rounded-md bg-white border">
                              <div>
                                <p className="font-medium font-sans text-lg">{item.name}</p>
                                <p className="text-base text-gray-600 font-sans">${item.price.toFixed(2)} each</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-sans text-lg">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between font-bold text-xl">
                        <span className="font-sans">Total:</span>
                        <span className="font-sans">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Customer Information</CardTitle>
                <CardDescription>
                  <div className="font-sans text-lg">
                    <p>In-stock items can be picked up Monday-Friday, 9 AM-5 PM.</p>
                    <p>Made to Order items can be ordered before Wednesday 6pm and can be picked up on Saturdays between 9AM-5PM.</p>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form 
                    onSubmit={async (e) => {
                      console.log('Form submit event triggered');
                      e.preventDefault();
                      const formData = form.getValues();
                      console.log('Form data:', formData);
                      await onSubmit(formData);
                    }} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sans text-lg">Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" {...field} className="font-sans text-lg" />
                            </FormControl>
                            <FormMessage className="font-sans text-base" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sans text-lg">Phone <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Phone number (xxx-xxx-xxxx)" 
                                {...field} 
                                className="font-sans text-lg"
                                onChange={(e) => {
                                  field.onChange(formatPhoneNumber(e.target.value));
                                }}
                                maxLength={12}
                              />
                            </FormControl>
                            <FormMessage className="font-sans text-base" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans text-lg">Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} className="font-sans text-lg" />
                          </FormControl>
                          <FormMessage className="font-sans text-base" />
                        </FormItem>
                      )}
                    />

                    {inStockItems.length > 0 && (
                      <div className="space-y-6 border-t pt-6">
                        <h3 className="font-medium text-lg text-bakery-brown">In-Stock Items Pickup</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="inStockPickupDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="font-sans text-lg">Pickup Date <span className="text-red-500">*</span></FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "pl-3 text-left font-normal font-sans text-lg",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Select date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      fromDate={(() => {
                                        const now = new Date();
                                        const minDate = new Date(now);
                                        minDate.setDate(now.getDate() + 1); // Next day pickup
                                        return minDate;
                                      })()}
                                      disabled={(date) => {
                                        // Disable weekends (Saturday = 6, Sunday = 0)
                                        return date.getDay() === 0 || date.getDay() === 6;
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage className="font-sans text-base" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="inStockPickupTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-sans text-lg">Pickup Time <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="font-sans text-lg">
                                      <SelectValue placeholder="Select a pickup time" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[
                                      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
                                      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                                      "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
                                      "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
                                      "5:00 PM"
                                    ].map((time) => (
                                      <SelectItem key={time} value={time} className="font-sans text-lg">
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="font-sans text-base" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {madeToOrderItems.length > 0 && (
                      <div className="space-y-6 border-t pt-6">
                        <h3 className="font-medium text-lg text-bakery-brown">Made-to-Order Items Pickup</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="madeToOrderPickupDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="font-sans text-lg">Pickup Date <span className="text-red-500">*</span></FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "pl-3 text-left font-normal font-sans text-lg",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Select date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      fromDate={(() => {
                                        const now = new Date();
                                        const currentDay = now.getDay();
                                        const currentHour = now.getHours();
                                        
                                        console.log('Current day:', currentDay);
                                        console.log('Current hour:', currentHour);
                                        
                                        // If we're past Wednesday or it's Wednesday after 6 PM
                                        if (currentDay > 3 || (currentDay === 3 && currentHour >= 18)) {
                                          // Calculate the next Saturday
                                          const daysUntilNextSaturday = (6 - currentDay + 7) % 7;
                                          const upcomingSaturday = new Date(now);
                                          upcomingSaturday.setDate(now.getDate() + daysUntilNextSaturday);
                                          
                                          // Calculate the Saturday after next
                                          const saturdayAfterNext = new Date(upcomingSaturday);
                                          saturdayAfterNext.setDate(upcomingSaturday.getDate() + 7);
                                          
                                          console.log('After Wednesday 6 PM - Saturday after next:', saturdayAfterNext.toDateString());
                                          return saturdayAfterNext;
                                        } else {
                                          // Before Wednesday 6 PM, allow any Saturday that's at least 3 days away
                                          const minDate = new Date(now);
                                          minDate.setDate(now.getDate() + 3); // At least 3 days from now
                                          console.log('Before Wednesday 6 PM - Min date:', minDate.toDateString());
                                          return minDate;
                                        }
                                      })()}
                                      disabled={(date) => date.getDay() !== 6} // Only allow Saturdays
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage className="font-sans text-base" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="madeToOrderPickupTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-sans text-lg">Pickup Time <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="font-sans text-lg">
                                      <SelectValue placeholder="Select a pickup time" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[
                                      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
                                      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                                      "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
                                      "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
                                      "5:00 PM"
                                    ].map((time) => (
                                      <SelectItem key={time} value={time} className="font-sans text-lg">
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="font-sans text-base" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans text-lg">Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requests or dietary concerns?" 
                              className="resize-none font-sans text-lg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="font-sans text-base" />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-bakery-brown hover:bg-bakery-light text-white font-sans text-lg"
                      disabled={cart.length === 0}
                    >
                      {cart.length === 0 ? "Add items to cart to place order" : "Place Order"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
