import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import emailjs from '@emailjs/browser';
import { bulkOrderEmailTemplate } from '@/email-templates';

// Define form schema
const bulkOrderFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  company: z.string().optional(),
  eventDate: z.string().optional(),
  quantity: z.string().min(1, { message: 'Please specify the quantity' }),
  items: z.string().min(1, { message: 'Please describe the items you need' }),
  specialRequirements: z.string().optional(),
});

type BulkOrderFormValues = z.infer<typeof bulkOrderFormSchema>;

const BulkOrderPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BulkOrderFormValues>({
    resolver: zodResolver(bulkOrderFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      eventDate: '',
      quantity: '',
      items: '',
      specialRequirements: '',
    },
  });

  const onSubmit = async (data: BulkOrderFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare email template parameters
      const templateParams = {
        to_email: 'myjilicioustreats@gmail.com',
        from_name: data.name,
        from_email: data.email,
        phone: data.phone,
        company: data.company || 'Not specified',
        event_date: data.eventDate || 'Not specified',
        quantity: data.quantity,
        items: data.items,
        special_requirements: data.specialRequirements || 'None',
        message: bulkOrderEmailTemplate
      };

      console.log('Sending bulk order email with parameters:', templateParams);

      // Send email using EmailJS
      const result = await emailjs.send(
        'service_10tkiq3',
        'template_ul8gc01',
        templateParams,
        'jRgg2OkLA0U1pS4WQ'
      );

      console.log('Bulk order email sent successfully:', result);
      
      toast({
        title: "Inquiry Received!",
        description: "Thank you for your interest. We'll get back to you within 24 hours.",
      });
      
      form.reset();
    } catch (error) {
      console.error('Error sending bulk order inquiry:', error);
      // Log more detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-bakery-brown text-center mb-4">
        Bulk Order Inquiry
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
        Planning a large order for an event or business? Fill out this form and we'll get back to you with a custom quote.
      </p>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Bulk Order Request</CardTitle>
            <CardDescription>
              Please provide as much detail as possible about your order requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company/Organization (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approximate Quantity</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 50 pieces" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="items"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Items Needed</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please describe the items you need (e.g., 25 chocolate croissants, 25 almond croissants)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requirements (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any dietary restrictions, packaging requirements, or other special needs"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-bakery-brown hover:bg-bakery-light text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>We'll review your inquiry and get back to you within 24 hours.</p>
          <p className="mt-2">For urgent inquiries, please call us directly.</p>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderPage; 