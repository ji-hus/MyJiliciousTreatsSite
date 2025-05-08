import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone, Mail, Home, Instagram } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import emailjs from '@emailjs/browser';
import { contactEmailTemplate } from '@/email-templates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

const bulkOrderFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  company: z.string().optional(),
  event_date: z.string().min(1, { message: 'Please select an event date' }),
  quantity: z.string().min(1, { message: 'Please specify the quantity' }),
  items: z.string().min(10, { message: 'Please describe the items needed' }),
  special_requirements: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;
type BulkOrderFormValues = z.infer<typeof bulkOrderFormSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const bulkOrderForm = useForm<BulkOrderFormValues>({
    resolver: zodResolver(bulkOrderFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      event_date: '',
      quantity: '',
      items: '',
      special_requirements: '',
    },
  });

  const onSubmitContact = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        message: data.message,
        phone: '',
        company: '',
        event_date: '',
        quantity: '',
        items: '',
        special_requirements: ''
      };

      const result = await emailjs.send(
        'service_10tkiq3',
        'template_zm1pn05',
        templateParams,
        'jRgg2OkLA0U1pS4WQ'
      );

      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. We'll get back to you soon!",
      });
      
      contactForm.reset();
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitBulkOrder = async (data: BulkOrderFormValues) => {
    setIsSubmitting(true);
    try {
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        phone: data.phone,
        company: data.company || 'N/A',
        event_date: data.event_date,
        quantity: data.quantity,
        items: data.items,
        special_requirements: data.special_requirements || 'None',
        type: 'bulk_order'
      };

      const result = await emailjs.send(
        'service_10tkiq3',
        'template_zm1pn05',
        templateParams,
        'jRgg2OkLA0U1pS4WQ'
      );

      toast({
        title: "Bulk Order Request Sent!",
        description: "Thank you for your interest. We'll review your request and get back to you soon!",
      });
      
      bulkOrderForm.reset();
    } catch (error) {
      console.error('Error sending bulk order form:', error);
      toast({
        title: "Error",
        description: "Failed to send bulk order request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-bakery-brown text-center mb-4">
        Contact Us
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
        Have questions about our products or want to place a special order? We'd love to hear from you!
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Get in Touch</CardTitle>
              <CardDescription>Choose how you'd like to contact us</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="contact" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="contact">Contact Us</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk Order Inquiry</TabsTrigger>
                </TabsList>
                
                <TabsContent value="contact">
                  <form onSubmit={contactForm.handleSubmit(onSubmitContact)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                        <Input 
                          id="name"
                          {...contactForm.register('name')}
                          placeholder="Your name"
                        />
                        {contactForm.formState.errors.name && (
                          <p className="text-red-500 text-sm mt-1">{contactForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <Input 
                          id="email"
                          type="email"
                          {...contactForm.register('email')}
                          placeholder="your.email@example.com"
                        />
                        {contactForm.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{contactForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                        <Textarea 
                          id="message"
                          {...contactForm.register('message')}
                          placeholder="How can we help you?"
                          rows={5}
                        />
                        {contactForm.formState.errors.message && (
                          <p className="text-red-500 text-sm mt-1">{contactForm.formState.errors.message.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-bakery-brown hover:bg-bakery-light text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="bulk">
                  <form onSubmit={bulkOrderForm.handleSubmit(onSubmitBulkOrder)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label htmlFor="bulk-name" className="block text-sm font-medium mb-1">Name</label>
                        <Input 
                          id="bulk-name"
                          {...bulkOrderForm.register('name')}
                          placeholder="Your name"
                        />
                        {bulkOrderForm.formState.errors.name && (
                          <p className="text-red-500 text-sm mt-1">{bulkOrderForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="bulk-email" className="block text-sm font-medium mb-1">Email</label>
                        <Input 
                          id="bulk-email"
                          type="email"
                          {...bulkOrderForm.register('email')}
                          placeholder="your.email@example.com"
                        />
                        {bulkOrderForm.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{bulkOrderForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="bulk-phone" className="block text-sm font-medium mb-1">Phone</label>
                        <Input 
                          id="bulk-phone"
                          type="tel"
                          {...bulkOrderForm.register('phone')}
                          placeholder="(123) 456-7890"
                        />
                        {bulkOrderForm.formState.errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{bulkOrderForm.formState.errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="bulk-company" className="block text-sm font-medium mb-1">Company/Organization (Optional)</label>
                        <Input 
                          id="bulk-company"
                          {...bulkOrderForm.register('company')}
                          placeholder="Your company or organization name"
                        />
                      </div>

                      <div>
                        <label htmlFor="bulk-event-date" className="block text-sm font-medium mb-1">Event Date</label>
                        <Input 
                          id="bulk-event-date"
                          type="date"
                          {...bulkOrderForm.register('event_date')}
                        />
                        {bulkOrderForm.formState.errors.event_date && (
                          <p className="text-red-500 text-sm mt-1">{bulkOrderForm.formState.errors.event_date.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="bulk-quantity" className="block text-sm font-medium mb-1">Quantity Needed</label>
                        <Input 
                          id="bulk-quantity"
                          {...bulkOrderForm.register('quantity')}
                          placeholder="e.g., 50, 100, 200, etc."
                        />
                        {bulkOrderForm.formState.errors.quantity && (
                          <p className="text-red-500 text-sm mt-1">{bulkOrderForm.formState.errors.quantity.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="bulk-items" className="block text-sm font-medium mb-1">Items Needed</label>
                        <Textarea 
                          id="bulk-items"
                          {...bulkOrderForm.register('items')}
                          placeholder="Please describe the items you need in detail; 25 cookies, 25 cupcakes, 50 macarons, etc."
                          rows={3}
                        />
                        {bulkOrderForm.formState.errors.items && (
                          <p className="text-red-500 text-sm mt-1">{bulkOrderForm.formState.errors.items.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="bulk-requirements" className="block text-sm font-medium mb-1">Special Requirements (Optional)</label>
                        <Textarea 
                          id="bulk-requirements"
                          {...bulkOrderForm.register('special_requirements')}
                          placeholder="Any dietary restrictions, allergies, or special requests"
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-bakery-brown hover:bg-bakery-light text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Submit Bulk Order Request'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Contact Information</CardTitle>
              <CardDescription>Ways to reach us</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start">
                <Home className="h-5 w-5 mr-4 text-bakery-gold mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Address</h3>
                  <p className="text-gray-600">Contact for Pickup Location</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-4 text-bakery-gold mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Phone</h3>
                  <p className="text-gray-600">248-403-0780</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-4 text-bakery-gold mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Email</h3>
                  <p className="text-gray-600">myjilicioustreats@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Instagram className="h-5 w-5 mr-4 text-bakery-gold mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Instagram</h3>
                  <a 
                    href="https://instagram.com/jilicioustreats" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-bakery-brown hover:text-bakery-gold transition-colors"
                  >
                    @jilicioustreats
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
