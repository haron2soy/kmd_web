import { PageLayout } from '@/shared/components/layout/PageLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Contact() {
  return (
    <PageLayout>
      <div className="bg-slate-100 border-b border-slate-200 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">Contact Us</h1>
          <p className="mt-4 text-slate-600 max-w-2xl text-lg">
            We are here to assist you with any meteorological inquiries. Please reach out to us using the form below or our direct contact details.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div>
            <Card className="rounded-sm shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="font-serif text-primary">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-bold text-slate-700">Full Name</label>
                      <Input id="name" placeholder="John Doe" className="rounded-sm" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</label>
                      <Input id="email" type="email" placeholder="john@example.com" className="rounded-sm" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-bold text-slate-700">Subject</label>
                    <Input id="subject" placeholder="Inquiry regarding..." className="rounded-sm" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-bold text-slate-700">Message</label>
                    <Textarea id="message" placeholder="Type your message here..." className="min-h-[150px] rounded-sm" />
                  </div>

                  <Button type="button" className="w-full bg-primary hover:bg-primary/90 rounded-sm font-bold h-12">
                    Submit Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Details & Map */}
          <div className="space-y-8">
            <div className="bg-white p-8 border-l-4 border-accent shadow-sm">
              <h3 className="font-serif font-bold text-2xl text-primary mb-6">Headquarters</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Physical Address</h4>
                    <p className="text-slate-600 mt-1">
                      Kenya Meteorological Department Headquarters<br />
                      Ngong Road, Dagoretti Corner<br />
                      Nairobi, Kenya
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="bg-slate-100 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Phone Contacts</h4>
                    <p className="text-slate-600 mt-1">
                      +254 20 386 7880<br />
                      +254 724 255 153
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="bg-slate-100 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Email</h4>
                    <p className="text-slate-600 mt-1">
                      info@meteo.go.ke<br />
                      director@meteo.go.ke
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="bg-slate-200 h-64 rounded-sm flex items-center justify-center border border-slate-300">
               <span className="text-slate-500 font-medium flex items-center gap-2">
                 <MapPin className="h-5 w-5" /> Google Maps Embed Placeholder
               </span>
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
}
