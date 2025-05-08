import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-bakery-brown mb-4">
              Our Story
            </h2>
            <p className="text-gray-700 mb-4">
              Ji'licious Treats was born out of a passion for traditional baking techniques and quality ingredients. What started as weekend baking for family and friends quickly grew into a beloved micro bakery serving our local community.
            </p>
            <p className="text-gray-700 mb-6">
              Each day, we carefully craft small batches of artisanal breads, pastries, and treats in our home kitchen. We believe in using simple, wholesome ingredients and letting the natural flavors shine through in everything we make.
            </p>
            <Button 
              asChild
              className="bg-bakery-brown hover:bg-bakery-light text-white"
            >
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
          
          <div className="w-full md:w-1/2 order-1 md:order-2 mb-8 md:mb-0">
            <div className="relative h-64 md:h-96 bg-bakery-cream rounded-xl overflow-hidden shadow-md">
              <img 
                src="/images/pexels-timo-peischl-632000331-17475208.jpg" 
                alt="Our Story" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
