import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilteredMenuItems, useMenu } from '@/contexts/MenuContext';
import { Vegan, EggOff, MilkOff, WheatOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Menu = () => {
  const { categories } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || '');
  const filteredItems = useFilteredMenuItems(selectedCategory, true);

  const categoryTabs = useMemo(() => (
    <TabsList className="grid grid-cols-5 mb-8">
      {categories.map(category => (
        <TabsTrigger key={category} value={category}>
          {category}
        </TabsTrigger>
      ))}
    </TabsList>
  ), [categories]);

  const menuItems = useMemo(() => (
    categories.map(category => (
      <TabsContent key={category} value={category}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
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
                    {item.dietaryInfo.vegan && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="flex items-center gap-1 p-2">
                            <Vegan size={16} className="text-green-600" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Vegan - Contains no animal products</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {item.dietaryInfo.glutenFree && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="flex items-center gap-1 p-2">
                            <WheatOff size={16} className="text-yellow-600" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Gluten Free - No wheat, rye, or barley</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {item.dietaryInfo.nutFree && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="flex items-center gap-1 p-2">
                            <EggOff size={16} className="text-yellow-600" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Nut Free - No nuts or nut products</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {item.dietaryInfo.dairyFree && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="flex items-center gap-1 p-2">
                            <MilkOff size={16} className="text-blue-600" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Dairy Free - No milk or dairy products</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
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
  ), [filteredItems]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold text-center mb-8">Our Menu</h1>

      <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        {categoryTabs}
        {menuItems}
      </Tabs>
    </div>
  );
};

export default Menu;
