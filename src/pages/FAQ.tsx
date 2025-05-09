import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FAQPage = () => {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "You can place an order through our website by selecting items from our menu and following the checkout process. All orders must be placed at least 24 hours in advance."
    },
    {
      question: "What are your pickup times?",
      answer: "In-stock items can be picked up Monday through Friday between 9 AM to 5 PM. Made-to-order items can be picked up on Saturdays from 9 AM to 5 PM. All made-to-order items must be ordered before Wednesday at 6 PM. Orders placed before Wednesday 6 PM can be picked up the upcoming Saturday, while orders placed after Wednesday 6 PM will be scheduled for pickup the following Saturday."
    },
    {
      question: "Do you offer delivery?",
      answer: "Currently, we only offer pickup service at our location."
    },
    {
      question: "What is your order deadline?",
      answer: "Orders for made-to-order items close on Wednesdays at 6 PM. Orders placed before Wednesday 6 PM can be picked up the upcoming Saturday, while orders placed after Wednesday 6 PM will be scheduled for pickup the following Saturday. In-stock items can be ordered anytime during business hours (Monday-Friday, 9 AM-5 PM)."
    },
    {
      question: "Do you accommodate dietary restrictions?",
      answer: "Yes! We offer various options for dietary restrictions including vegan, gluten-free, dairy-free, and nut-free items. These are clearly marked on our menu."
    },
    {
      question: "How do I place a bulk order?",
      answer: "For bulk orders (10+ items), please use our bulk order inquiry form. This allows us to better accommodate larger orders and discuss any special requirements."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash and Zelle payments at pickup. Payment is collected when you pick up your order."
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "Orders can be modified or cancelled up until the order deadline (Thursday at 6pm). Please contact us as soon as possible if you need to make changes."
    },
    {
      question: "Do you offer custom orders?",
      answer: "Yes, we can accommodate custom orders for special occasions. Please contact us at least one week in advance to discuss your requirements."
    },
    {
      question: "How long do your products stay fresh?",
      answer: "Our products are best enjoyed within 2-3 days of pickup. We recommend storing them in an airtight container at room temperature."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-bakery-brown text-center mb-4">
        Frequently Asked Questions
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
        Find answers to common questions about our bakery, ordering process, and products.
      </p>

      <div className="max-w-4xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="p-6">
              <h3 className="font-serif font-semibold text-xl text-bakery-brown mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Section */}
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <h2 className="text-2xl font-serif font-bold text-bakery-brown mb-4">
          Still Have Questions?
        </h2>
        <p className="text-gray-600 mb-6">
          We're here to help! Contact us directly and we'll get back to you as soon as possible.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-bakery-brown hover:bg-bakery-light text-white"
          >
            <Link to="/contact">Contact Us</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10"
          >
            <Link to="/order">Place an Order</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FAQPage; 