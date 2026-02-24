import { PageLayout } from '@/shared/components/layout/PageLayout';
//import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CloudRain, AlertTriangle, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import background_image1 from '@/shared/assets/background/image1.jpg';
import background_image2 from '@/shared/assets/background/image.jpg';
import background_image3 from '@/shared/assets/background/clouds-sky.jpg';
import background_image4 from '@/shared/assets/background/beautiful-clouds.jpg';
import AnnouncementList from './Announcements';
import NewsList from './News';

export default function Home() {
  const heroImages = [background_image1, background_image2, background_image3, background_image4];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const stayDuration = 10000; // 3s
    const transitionDuration = 1000; // 1s smooth pan/fade

    const timeout = setTimeout(() => {
      setIsTransitioning(true);

      const transitionTimeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        setIsTransitioning(false);
      }, transitionDuration);

      return () => clearTimeout(transitionTimeout);
    }, stayDuration);

    return () => clearTimeout(timeout);
  }, [currentIndex]);

  //const currentImage = heroImages[currentIndex];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative bg-primary text-white overflow-hidden h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 z-10"></div>  
          {/* Background images */}
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-opacity duration-2000",
                index === currentIndex
                  ? "opacity-100"
                  : "opacity-0"
              )}
              style={{
                backgroundImage: `url(${img})`,
                backgroundPosition: isTransitioning ? "10% center" : "0% center", // small pan
              }}
            />
          ))}

        <div className="container mx-auto px-4 py-5 relative z-20">
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

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Mission Statement */}
            <div className="bg-white p-8 border-l-4 border-primary shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-primary mb-4">Our Mission</h2>
              <p className="text-lg text-slate-700 leading-relaxed">
                To facilitate the provision of meteorological services, including severe weather guidance and capacity building, to support the safety of life and property and the socio-economic development of the region.
              </p>
            </div>

            {/* News Section */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-4">Latest News</h2>
              <NewsList />
            </section>

            {/* Announcements Section */}
            <section className="mt-12">
              <h2 className="text-2xl font-serif font-bold text-primary mb-4">Announcements</h2>
              <AnnouncementList />
            </section>
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
