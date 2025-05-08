
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    name: "Sarah J.",
    text: "The sourdough bread is exceptional - crispy crust with a perfect chewy interior. My family looks forward to our weekly order!",
    rating: 5,
  },
  {
    name: "Michael T.",
    text: "Ji'licious Treats' cinnamon rolls are the best I've ever had. Perfectly balanced sweetness and the freshest ingredients.",
    rating: 5,
  },
  {
    name: "Emily R.",
    text: "I love the attention to detail in everything they bake. You can really taste the difference of homemade quality.",
    rating: 5,
  },
  {
    name: "David K.",
    text: "The pre-order system is so convenient, and the pastries are always fresh and delicious. Highly recommend!",
    rating: 5,
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-16 bg-bakery-beige">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-bakery-brown mb-2">
          What Our Customers Say
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Don't just take our word for it - here's what our happy customers have to say about Ji'licious Treats.
        </p>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex overflow-hidden">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className={`w-full flex-shrink-0 transition-opacity duration-300 ${
                    index === activeIndex ? 'opacity-100' : 'opacity-0 hidden'
                  }`}
                >
                  <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex justify-center mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} className="w-6 h-6 text-bakery-gold" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-lg text-gray-700 text-center italic mb-6">"{testimonial.text}"</p>
                      <p className="font-semibold text-center text-bakery-brown">{testimonial.name}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === activeIndex ? 'bg-bakery-brown' : 'bg-bakery-light/30'
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
