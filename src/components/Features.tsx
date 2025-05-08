
import { Utensils, Package, Calendar } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Utensils className="h-12 w-12 text-bakery-gold" />,
      title: "Artisan Quality",
      description: "Every item is handcrafted with quality ingredients and traditional techniques for an authentic, homemade taste."
    },
    {
      icon: <Package className="h-12 w-12 text-bakery-gold" />,
      title: "Fresh Daily",
      description: "We bake our products fresh daily in small batches to ensure you get the best quality and flavor."
    },
    {
      icon: <Calendar className="h-12 w-12 text-bakery-gold" />,
      title: "Easy Pre-Orders",
      description: "Order ahead to secure your favorite items with our simple pre-order system."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-bakery-brown mb-12">
          Why Choose Ji'licious Treats?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-lg transition-all duration-300 hover:shadow-md"
            >
              <div className="mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-serif font-semibold text-bakery-brown mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
