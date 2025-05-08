import { useState } from 'react';
import { categories } from '@/data/menu-items';
import { useMenu } from '@/contexts/MenuContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Vegan, WheatOff, EggOff, MilkOff } from 'lucide-react';

const MenuPage = () => {
  const { menuItems, dietaryRestrictions } = useMenu();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const specialItems = menuItems.filter(item => item.isSpecial);

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

  // Function to get the appropriate badge class for a dietary restriction
  const getDietaryBadgeClass = (restriction: string) => {
    const color = getDietaryColor(restriction);
    return `bg-${color}-100 text-${color}-800 hover:bg-${color}-200`;
  };

  // Function to format dietary restriction name
  const formatDietaryName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-bakery-beige/50 py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-bakery-brown mb-4">Our Menu</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto px-4">
              Explore our selection of freshly baked artisanal breads, pastries, and treats. 
              Everything is made from scratch with high-quality ingredients.
            </p>
          </div>
        </div>
      </div>

      {/* This Week's Specials */}
      {specialItems.length > 0 && (
        <section className="bg-bakery-gold/10 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-bakery-brown text-center mb-6">
                This Week's Specials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {specialItems.map(item => (
                  <Card key={item.id} className="bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-24 w-24 bg-bakery-cream/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-bakery-brown text-5xl">🍪</span>
                        </div>
                        <div>
                          <h3 className="font-serif font-semibold text-xl text-bakery-brown mb-2">{item.name}</h3>
                          <p className="text-gray-600 mb-2">{item.description}</p>
                          <p className="text-bakery-brown font-medium">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* Menu Introduction */}
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-center text-gray-700 mb-6">
            At Ji'licious Treats, every item is made fresh to order in small batches. 
            We use traditional baking methods and quality ingredients to create delicious, 
            artisanal goods with that unmistakable homemade touch.
          </p>
          <p className="text-center text-gray-700">
            Please note that pre-orders are required for all items. We bake to order to ensure 
            you receive the freshest products possible.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 border-t border-b border-bakery-cream/70 py-6">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            className={activeCategory === 'all' ? 'bg-bakery-brown hover:bg-bakery-light' : 'border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10'}
            onClick={() => setActiveCategory('all')}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? 'default' : 'outline'}
              className={activeCategory === category ? 'bg-bakery-brown hover:bg-bakery-light' : 'border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10'}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden border-bakery-cream hover:shadow-md transition-shadow">
              <div className="h-48 bg-bakery-cream/20 flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="font-serif text-xl text-bakery-brown">{item.name}</p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-serif font-bold text-lg">{item.name}</h3>
                  <span className="font-medium text-bakery-brown">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-gray-600 mb-4">{item.description}</p>
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

                {/* Allergen Information */}
                {Object.entries(item.allergens || {}).some(([_, present]) => present) && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Contains:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.allergens || {})
                        .filter(([_, present]) => present)
                        .map(([allergen]) => (
                          <Badge
                            key={allergen}
                            variant="outline"
                            className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                          >
                            {formatDietaryName(allergen)}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  {item.madeToOrder ? (
                    <Badge variant="outline" className="text-bakery-brown border-bakery-brown">
                      Made to Order
                    </Badge>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className={item.stock > 0 ? "text-green-600 border-green-600" : "text-red-600 border-red-600"}
                    >
                      {item.stock} in stock
                    </Badge>
                  )}
                  <Link to={`/order?item=${item.id}`}>
                    <Button className="bg-bakery-brown hover:bg-bakery-light">
                      Order Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Order Information */}
        <div className="mt-16 mb-10 max-w-3xl mx-auto bg-bakery-beige/30 p-6 rounded-lg">
          <h3 className="text-xl font-serif font-bold text-bakery-brown text-center mb-4">How to Order</h3>
          <div className="space-y-4 text-gray-700">
            <p>
              1. Browse our menu and select the items you'd like to order.
            </p>
            <p>
              2. Click the "Pre-Order" button for each item to add it to your order.
            </p>
            <p>
              3. Complete the order form with your contact information and pickup details.
            </p>
            <p>
              4. We'll confirm your order and provide pickup instructions.
            </p>
          </div>
          <div className="mt-6 text-center">
            <Button 
              asChild
              className="bg-bakery-brown hover:bg-bakery-light text-white"
            >
              <Link to="/order">Place Your Order</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
