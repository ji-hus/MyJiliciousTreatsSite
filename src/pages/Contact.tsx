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

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare email template parameters
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        message: data.message
      };

      console.log('Sending contact form email with parameters:', templateParams);

      // Send email using EmailJS
      const result = await emailjs.send(
        'service_10tkiq3',
        'template_zm1pn05',
        templateParams,
        'jRgg2OkLA0U1pS4WQ'
      );

      console.log('Contact form email sent successfully:', result);

      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. We'll get back to you soon!",
      });
      
      form.reset();
    } catch (error) {
      console.error('Error sending contact form:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
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
              <CardTitle className="font-serif">Send Us a Message</CardTitle>
              <CardDescription>Fill out the form and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                    <Input 
                      id="name"
                      {...form.register('name')}
                      placeholder="Your name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <Input 
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="your.email@example.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                    <Textarea 
                      id="message"
                      {...form.register('message')}
                      placeholder="How can we help you?"
                      rows={5}
                    />
                    {form.formState.errors.message && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.message.message}</p>
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
