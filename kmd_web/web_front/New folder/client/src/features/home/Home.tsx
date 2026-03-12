// src/features/home/pages/Home.tsx
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/shared/components/ui/button";
import { CloudRain } from "lucide-react";
import ActiveWarnings from "@/features/Alerts/ActiveWarnings";
import { cn } from "@/lib/utils";

import background1 from "@/shared/assets/background/image1.jpg";
import background2 from "@/shared/assets/background/image.jpg";
import background3 from "@/shared/assets/background/clouds-sky.jpg";
import background4 from "@/shared/assets/background/beautiful-clouds.jpg";

import AnnouncementList from "./Announcements";
import NewsList from "./News";
import Events from "@/features/home/Events";

/* ===============================
   Hero Images & Interval
=============================== */
const HERO_IMAGES = [background1, background2, background3, background4];
const HERO_INTERVAL = 10000; // 10s

/* ===============================
   Sidebar Types & Data
=============================== */
interface Product {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const products: Product[] = [
  { label: "Forecasts", href: "/forecasts" },
  { label: "NWP Model", href: "/nwp-models" },
  { label: "Marine Bulletin", href: "/guidance/marine-forecast-daily" },
  { label: "Guidance", href: "/guidance" },
  { label: "Climate Quarterly Outlook", href: "/swfp-evaluation" },
];

/* ===============================
   Sidebar Component
=============================== */
function Sidebar() {
  return (
    <aside className="space-y-10">
      {/* Meteorological Products */}
      <div className="bg-primary text-white p-6 rounded-sm shadow-md">
        <h3 className="font-serif font-bold text-xl mb-4 border-b border-white/20 pb-2">
          Meteorological Products
        </h3>
        <ul className="space-y-3">
          {products.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="flex items-center gap-3 p-3 bg-white/10 hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm text-sm font-medium">
                  <CloudRain className="h-4 w-4" />
                  {item.label}
                
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Active Warnings */}
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-sm max-h-[400px] overflow-y-auto">
        <ActiveWarnings />
      </div>

      <Events />

    </aside>
  );
}



/* ===============================
   Home Component
=============================== */
export default function Home() {
  const [index, setIndex] = useState(0);

  /* Hero Slider */
  useEffect(() => {
    document.title = "Home | RSMC Nairobi";
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, HERO_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative h-[350px] text-white overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 z-10" />

        {/* Background Slides */}
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms]",
              i === index ? "opacity-100" : "opacity-0"
            )}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        <div className="container mx-auto px-4 relative z-20 h-full flex items-center">
          <div className="max-w-3xl">
            <span className="inline-block bg-accent text-accent-foreground px-3 py-1 text-sm font-bold uppercase tracking-wider mb-4 rounded-sm">
              Official Monitoring
            </span>

            <h1 className="text-white/90 text-2xl font-serif font-normal mb-4">
              Providing guidance for whole Eastern Africa domain
            </h1>

            <p className="text-lg md:text-xl text-slate-200 mb-8 leading-relaxed">
             Focusing on Heavy rain, strong winds, large waves (coastal areas of western Indian Ocean)
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/pages/services">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-8 h-12"
                >
                  Our Services
                </Button>
              </Link>

              <Link href="/pages/about-rsmc">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary px-8 h-12"
                >
                  About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-14">
            {/* Mission */}
            <div className="bg-white p-8 border-l-4 border-primary shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-primary mb-4">
                Our Mission
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed">
                To facilitate the provision of meteorological services,
                including severe weather guidance and capacity building,
                to support the safety of life and property and the
                socio-economic development of the region.
              </p>
            </div>

            {/* News */}
            <section>
              
              <NewsList />
            </section>

            {/* Announcements */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-primary mb-6">
                Announcements
              </h2>
              <AnnouncementList />
            </section>
          </div>

          {/* SIDEBAR */}
          <Sidebar />

        </div>
      </section>
    </>
  );
}