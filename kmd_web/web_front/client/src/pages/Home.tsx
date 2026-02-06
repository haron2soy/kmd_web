import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CloudRain, FileText, AlertTriangle, Calendar } from 'lucide-react';
import { Link } from 'wouter';

export default function Home() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-50" 
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1590055531615-f16d36ffe8ec?auto=format&fit=crop&q=80&w=2000)' }}
        ></div>
        
        <div className="container mx-auto px-4 py-5 md:py-5 relative z-20">
          <div className="max-w-3xl">
            <div className="inline-block bg-accent text-accent-foreground px-3 py-1 text-sm font-bold uppercase tracking-wider mb-4 rounded-sm">
              Official Monitoring
            </div>
            <h1 className="text-white/90 text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-snug mb-6 max-w-3xl">
              Leading the Region in Meteorological Excellence
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-8 font-light leading-relaxed">
              Providing timely, accurate, and reliable weather services for disaster risk reduction and sustainable development.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/pages/services">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 border-none font-bold text-base h-12 px-8 rounded-sm">
                  Our Services
                </Button>
              </Link>
               <Link href="/pages/about-rsmc">
                <Button size="lg" variant="outline" className="text-white border-white bg-transparent hover:bg-white hover:text-primary font-bold text-base h-12 px-8 rounded-sm">
                  About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column (2/3) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Mission Statement */}
            <div className="bg-white p-8 border-l-4 border-primary shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-primary mb-4">Our Mission</h2>
              <p className="text-lg text-slate-700 leading-relaxed">
                To facilitate the provision of meteorological services, including severe weather guidance and capacity building, to support the safety of life and property and the socio-economic development of the region.
              </p>
            </div>

            {/* Latest News */}
            <div>
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
                <h2 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
                  <FileText className="h-6 w-6 text-accent" />
                  Latest News & Announcements
                </h2>
                <Link href="/news" className="text-sm font-bold text-primary hover:text-accent uppercase tracking-wide flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                 {[1, 2].map((i) => (
                  <Card key={i} className="rounded-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <img 
                      src={i === 1 ? "https://images.unsplash.com/photo-1580193769210-b8d1c049a7d9?auto=format&fit=crop&q=80&w=800" : "https://images.unsplash.com/photo-1561484930-998b6a7b22e8?auto=format&fit=crop&q=80&w=800"} 
                      alt="News Thumbnail" 
                      className="w-full h-48 object-cover"
                    />
                    <CardHeader className="p-5 pb-2">
                      <div className="text-xs font-bold text-accent-foreground/70 bg-slate-100 inline-block px-2 py-1 rounded-sm mb-2 w-fit">
                        {new Date().toLocaleDateString()}
                      </div>
                      <CardTitle className="font-serif text-xl text-primary leading-tight hover:text-accent cursor-pointer transition-colors">
                        {i === 1 ? "Regional Climate Forum 2024 Concludes Successfully" : "New Severe Weather Warning System Deployed"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-2">
                      <p className="text-slate-600 line-clamp-3 mb-4">
                        The regional forum brought together experts from 15 member states to discuss climate resilience strategies...
                      </p>
                      <Link href={`/news/${i}`}>
                        <span className="text-sm font-bold text-primary hover:text-accent cursor-pointer">Read Full Story &rarr;</span>
                      </Link>
                    </CardContent>
                  </Card>
                 ))}
              </div>
            </div>

          </div>

          {/* Sidebar Column (1/3) */}
          <div className="space-y-8">
            
            {/* Quick Access Services */}
            <div className="bg-primary text-white p-6 rounded-sm shadow-md">
               <h3 className="font-serif font-bold text-xl mb-4 border-b border-white/20 pb-2">
                 Meteorological Products
               </h3>
               <ul className="space-y-3">
                 {['Synoptic Analysis', 'Tropical Cyclone Guidance', 'Marine Bulletins', 'Aviation Forecasts', 'Climate Monthly Outlooks'].map((item) => (
                   <li key={item}>
                     <a href="#" className="flex items-center gap-3 p-3 bg-white/10 hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm text-sm font-medium">
                       <CloudRain className="h-4 w-4" />
                       {item}
                     </a>
                   </li>
                 ))}
               </ul>
            </div>

            {/* Warnings Widget */}
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-sm">
               <h3 className="font-serif font-bold text-xl text-amber-800 mb-4 flex items-center gap-2">
                 <AlertTriangle className="h-5 w-5 text-amber-600" />
                 Active Warnings
               </h3>
               <div className="space-y-4">
                 <div className="p-3 bg-white border-l-4 border-amber-500 shadow-sm text-sm">
                   <strong className="block text-amber-900 mb-1">Heavy Rainfall Alert</strong>
                   <span className="text-slate-600">Coastal regions expected to receive &gt;50mm over next 24hrs.</span>
                 </div>
                 <div className="p-3 bg-white border-l-4 border-yellow-400 shadow-sm text-sm">
                   <strong className="block text-yellow-900 mb-1">Small Craft Advisory</strong>
                   <span className="text-slate-600">Strong winds expected offshore. Fishermen advised to stay close to shore.</span>
                 </div>
               </div>
            </div>

             {/* Events */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
               <h3 className="font-serif font-bold text-xl text-primary mb-4 flex items-center gap-2">
                 <Calendar className="h-5 w-5 text-accent" />
                 Upcoming Events
               </h3>
               <ul className="divide-y divide-slate-100">
                 {[1, 2].map((i) => (
                   <li key={i} className="py-3 first:pt-0 last:pb-0">
                     <div className="flex gap-3">
                       <div className="bg-slate-100 text-slate-600 px-3 py-1 text-center rounded-sm h-fit">
                         <span className="block text-xs uppercase font-bold">Oct</span>
                         <span className="block text-xl font-bold">{10 + i}</span>
                       </div>
                       <div>
                         <h4 className="font-bold text-primary text-sm hover:underline cursor-pointer">
                           {i === 1 ? "Capacity Building Workshop" : "Annual Scientific Conference"}
                         </h4>
                         <p className="text-xs text-slate-500 mt-1">Nairobi, Kenya</p>
                       </div>
                     </div>
                   </li>
                 ))}
               </ul>
            </div>

          </div>
        </div>
      </section>
    </PageLayout>
  );
}
