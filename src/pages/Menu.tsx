import { useState } from 'react';
import { menuItems, categories } from '@/data/menu-items';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

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
      <section className="bg-bakery-gold/10 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-bakery-brown text-center mb-6">
              This Week's Specials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-24 w-24 bg-bakery-cream/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-bakery-brown text-5xl">🍪</span>
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-xl text-bakery-brown mb-2">Sourdough Chocolate Chip Cookies</h3>
                      <p className="text-gray-600 mb-2">Crispy on the outside and soft on the inside - all while gut healthy!</p>
                      <p className="text-bakery-brown font-medium">$5.99 for 3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-24 w-24 bg-bakery-cream/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-bakery-brown text-5xl">🍞</span>
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-xl text-bakery-brown mb-2">Double Chocolate Espresso Sourdough Loaf</h3>
                      <p className="text-gray-600 mb-2">A decadent dessert loaf with a rich chocolate flavor and a hint of liquid gold espresso.</p>
                      <p className="text-bakery-brown font-medium">$4.99</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

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
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.dietaryInfo.vegan && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Vegan</Badge>
                  )}
                  {item.dietaryInfo.glutenFree && (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Gluten Free</Badge>
                  )}
                  {item.dietaryInfo.dairyFree && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Dairy Free</Badge>
                  )}
                  {item.dietaryInfo.nutFree && (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Nut Free</Badge>
                  )}
                </div>
                <div className="mb-4">
                  {item.madeToOrder ? (
                    <p className="text-bakery-brown font-medium">Made to Order</p>
                  ) : item.stock > 0 ? (
                    <p className="text-green-600 font-medium">{item.stock} in stock</p>
                  ) : (
                    <p className="text-red-600 font-medium">Out of stock</p>
                  )}
                </div>
                <Button
                  asChild
                  className="w-full bg-bakery-brown hover:bg-bakery-light"
                  disabled={!item.madeToOrder && item.stock === 0}
                >
                  <Link to={`/order?item=${item.id}`}>Pre-Order</Link>
                </Button>
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
