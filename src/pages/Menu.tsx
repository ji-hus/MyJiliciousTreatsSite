import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vegan, EggOff, MilkOff, WheatOff, Star } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMenu } from '@/contexts/MenuContext';

const Menu = () => {
  const { menuItems, dietaryRestrictions } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('=== Menu Component Debug Info ===');
    console.log('Menu Items:', menuItems);
    console.log('Menu Items Length:', menuItems?.length);
    console.log('Menu Items Type:', typeof menuItems);
    console.log('Is Menu Items Array?', Array.isArray(menuItems));
    console.log('First Item:', menuItems?.[0]);
    console.log('Last Item:', menuItems?.[menuItems?.length - 1]);
    console.log('Dietary Restrictions:', dietaryRestrictions);
    console.log('Selected Category:', selectedCategory);
    console.log('Search Query:', searchQuery);
    console.log('==============================');
  }, [menuItems, dietaryRestrictions, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    try {
      if (!Array.isArray(menuItems)) {
        console.error('menuItems is not an array:', menuItems);
        return ['All'];
      }
      const cats = ['All', ...new Set(menuItems.map(item => item.category))];
      console.log('Categories:', cats);
      return cats;
    } catch (err) {
      console.error('Error generating categories:', err);
      return ['All'];
    }
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    try {
      if (!Array.isArray(menuItems)) {
        console.error('menuItems is not an array in filteredItems:', menuItems);
        return [];
      }

      console.log('Filtering items...');
      console.log('Total items before filtering:', menuItems.length);
      
      const filtered = menuItems
        .filter(item => {
          if (!item) {
            console.error('Found null/undefined item in menuItems');
            return false;
          }
          const isActive = item.active;
          console.log(`Item ${item.name} active status:`, isActive);
          return isActive;
        })
        .filter(item => {
          const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
          console.log(`Item ${item.name} category match:`, matchesCategory, 'Item category:', item.category, 'Selected:', selectedCategory);
          return matchesCategory;
        })
        .filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
          console.log(`Item ${item.name} search match:`, matchesSearch);
          return matchesSearch;
        });
      
      console.log('Filtered items count:', filtered.length);
      console.log('Filtered items:', filtered);
      return filtered;
    } catch (err) {
      console.error('Error filtering items:', err);
      setError('Error loading menu items. Please try refreshing the page.');
      return [];
    }
  }, [menuItems, selectedCategory, searchQuery]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-bakery-brown text-white rounded-md"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold text-center mb-8">Our Menu</h1>

      {/* Category Selection */}
      <div className="overflow-x-auto pb-2 mb-8">
        <div className="flex space-x-2 min-w-max">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => {
                console.log('Category clicked:', category);
                setSelectedCategory(category);
              }}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-bakery-brown text-white'
                  : 'bg-bakery-cream/20 text-bakery-brown hover:bg-bakery-cream/40'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            {menuItems.length === 0 ? (
              <div>
                <p>No menu items available.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-bakery-brown text-white rounded-md"
                >
                  Refresh Page
                </button>
              </div>
            ) : (
              'No items found in this category.'
            )}
          </div>
        ) : (
          filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video relative bg-bakery-cream/20 flex items-center justify-center">
                <h3 className="text-2xl font-serif font-bold text-bakery-brown text-center px-4">
                  {item.name}
                </h3>
                {item.isSpecial && (
                  <Badge className="absolute top-2 right-2 bg-bakery-gold">
                    Special
                  </Badge>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-lg font-bold text-bakery-brown mb-2 block">${item.price.toFixed(2)}</span>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    {dietaryRestrictions.map(restriction => {
                      if (item.dietaryInfo[restriction]) {
                        let icon;
                        switch (restriction) {
                          case 'vegan':
                            icon = <Vegan size={16} className="text-green-600" />;
                            break;
                          case 'glutenFree':
                            icon = <WheatOff size={16} className="text-yellow-600" />;
                            break;
                          case 'nutFree':
                            icon = <EggOff size={16} className="text-yellow-600" />;
                            break;
                          case 'dairyFree':
                            icon = <MilkOff size={16} className="text-blue-600" />;
                            break;
                          case 'halal':
                            icon = <img src="/images/halalwhite.jpg" alt="Halal" className="w-4 h-4" />;
                            break;
                          case 'kosher':
                            icon = <Star size={16} className="text-purple-600" />;
                            break;
                          default:
                            return null;
                        }
                        return (
                          <Tooltip key={restriction}>
                            <TooltipTrigger>
                              <Badge variant="secondary" className="flex items-center gap-1 p-2">
                                {icon}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="capitalize">{restriction.replace(/([A-Z])/g, ' $1').trim()}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      return null;
                    })}
                  </TooltipProvider>
                </div>
                {Object.entries(item.allergens).some(([_, value]) => value) && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Contains:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.allergens).map(([allergen, present]) => 
                        present && (
                          <Badge key={allergen} variant="outline" className="text-red-600 border-red-600">
                            {allergen.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Menu;
