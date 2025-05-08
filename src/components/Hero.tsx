import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <div className="relative bg-bakery-light/10 py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 text-center md:text-left mb-10 md:mb-0 md:pr-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-bakery-brown mb-4">
            Baked with love <br />
            <span className="text-bakery-gold">Shared with joy</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-6 max-w-lg mx-auto md:mx-0">
          Thoughtfully crafted breads and sweets, where patience meets flavor.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button 
              asChild
              size="lg" 
              className="bg-bakery-brown hover:bg-bakery-light text-white font-medium"
            >
              <Link to="/menu">Explore Menu</Link>
            </Button>
            <Button 
              asChild
              size="lg" 
              variant="outline" 
              className="border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10"
            >
              <Link to="/order">Pre-Order Now</Link>
            </Button>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 relative">
          <div className="relative w-[200px] h-[200px] md:w-[450px] md:h-[450px] mx-auto bg-bakery-cream rounded-xl overflow-hidden shadow-xl">
            {/* This would be an actual image in a real site */}
            <div className="absolute inset-0 flex items-center justify-center bg-bakery-light/30">
              <div className="text-center">
                <div className="h-128 w-128 md:h-[384px] md:w-[384px] mx-auto">
                  <img 
                    src="/lovable-uploads/0eda8371-7361-4abe-8b6f-877094b410d2.png" 
                    alt="Ji'licious Treats" 
                    className="object-contain h-full w-full" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
