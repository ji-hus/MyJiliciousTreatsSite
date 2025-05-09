import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilteredMenuItems, useMenu } from '@/contexts/MenuContext';
import { Vegan, EggOff, MilkOff, WheatOff, Star } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Menu = () => {
  const { menuItems, dietaryRestrictions } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return menuItems
      .filter(item => item.active) // Only show active items
      .filter(item => selectedCategory === "All" || item.category === selectedCategory)
      .filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [menuItems, selectedCategory, searchQuery]);

  const categoryTabs = useMemo(() => (
    <TabsList className="flex flex-nowrap overflow-x-auto gap-2 mb-8 pb-2">
      {['All', ...new Set(menuItems.map(item => item.category))].map(category => (
        <TabsTrigger key={category} value={category} className="whitespace-nowrap">
          {category}
        </TabsTrigger>
      ))}
    </TabsList>
  ), [menuItems]);

  const menuItemsContent = useMemo(() => (
    ['All', ...new Set(menuItems.map(item => item.category))].map(category => (
      <TabsContent key={category} value={category}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video relative bg-bakery-cream/20 flex items-center justify-center">
                <h3 className="text-2xl font-serif font-bold text-bakery-brown text-center px-4">
                  {item.name}
                </h3>
                <div className="absolute top-2 right-2 flex gap-2">
                  {item.isSpecial && (
                    <Badge className="bg-bakery-gold">
                      Special
                    </Badge>
                  )}
                  {item.bestSeller && (
                    <Badge className="bg-bakery-brown">
                      Best Seller
                    </Badge>
                  )}
                </div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-lg font-bold text-bakery-brown mb-2 block">${Number(item.price || 0).toFixed(2)}</span>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  {item.madeToOrder && (
                    <Badge className="bg-bakery-brown">
                      Made to Order
                    </Badge>
                  )}
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
          ))}
        </div>
      </TabsContent>
    ))
  ), [filteredItems, dietaryRestrictions]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold text-center mb-8">Our Menu</h1>

      {/* This Week's Specials Section */}
      {menuItems.some(item => item.isSpecial && item.active) && (
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-center mb-6">This Week's Specials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems
              .filter(item => item.isSpecial && item.active)
              .map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-bakery-cream/20 flex items-center justify-center">
                    <h3 className="text-2xl font-serif font-bold text-bakery-brown text-center px-4">
                      {item.name}
                    </h3>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge className="bg-bakery-gold">
                        Special
                      </Badge>
                      {item.bestSeller && (
                        <Badge className="bg-bakery-brown">
                          Best Seller
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                    </div>
                  </CardHeader>
                  <CardContent>
                    <span className="text-lg font-bold text-bakery-brown mb-2 block">${Number(item.price || 0).toFixed(2)}</span>
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
              ))}
          </div>
        </div>
      )}

      <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        {categoryTabs}
        {menuItemsContent}
      </Tabs>
    </div>
  );
};

export default Menu;
