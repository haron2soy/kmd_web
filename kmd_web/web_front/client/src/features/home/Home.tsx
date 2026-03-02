// src/features/home/pages/Home.tsx

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/shared/components/ui/button";
import { CloudRain, AlertTriangle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

import background1 from "@/shared/assets/background/image1.jpg";
import background2 from "@/shared/assets/background/image.jpg";
import background3 from "@/shared/assets/background/clouds-sky.jpg";
import background4 from "@/shared/assets/background/beautiful-clouds.jpg";

import AnnouncementList from "./Announcements";
import NewsList from "./News";

const HERO_IMAGES = [
  background1,
  background2,
  background3,
  background4,
];

const HERO_INTERVAL = 10000; // 10s

export default function Home() {
  const [index, setIndex] = useState(0);

  /* --------------------------------------------------
     Hero Auto-Slider (cleaner interval logic)
  -------------------------------------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, HERO_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <>
      {/* ==================================================
         HERO SECTION
      ================================================== */}
      <section className="relative h-[420px] text-white overflow-hidden">
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

            <h1 className="text-white/90 text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-snug mb-6 max-w-3xl">
              Leading the Region in Meteorological Excellence
            </h1>

            <p className="text-lg md:text-xl text-slate-200 mb-8 leading-relaxed">
              Providing timely, accurate, and reliable weather services
              for disaster risk reduction and sustainable development.
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

      {/* ==================================================
         MAIN CONTENT
      ================================================== */}
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
              <h2 className="text-2xl font-serif font-bold text-primary mb-6">
                Latest News
              </h2>
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
          <aside className="space-y-10">

            {/* Products */}
            <div className="bg-primary text-white p-6 rounded-sm shadow-md">
              <h3 className="font-serif font-bold text-xl mb-4 border-b border-white/20 pb-2">
                Meteorological Products
              </h3>
              <ul className="space-y-3">
                {[
                  "Synoptic Analysis",
                  "Tropical Cyclone Guidance",
                  "Marine Bulletins",
                  "Aviation Forecasts",
                  "Climate Monthly Outlooks",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="flex items-center gap-3 p-3 bg-white/10 hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm text-sm font-medium"
                    >
                      <CloudRain className="h-4 w-4" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings */}
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-sm">
              <h3 className="font-serif font-bold text-xl text-amber-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Active Warnings
              </h3>

              <div className="space-y-4 text-sm">
                <WarningCard
                  title="Heavy Rainfall Alert"
                  description="Coastal regions expected to receive >50mm over next 24hrs."
                  color="amber"
                />
                <WarningCard
                  title="Small Craft Advisory"
                  description="Strong winds expected offshore. Fishermen advised to stay close to shore."
                  color="yellow"
                />
              </div>
            </div>

            {/* Events */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
              <h3 className="font-serif font-bold text-xl text-primary mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Upcoming Events
              </h3>

              <ul className="divide-y divide-slate-100">
                {[
                  { day: 11, title: "Capacity Building Workshop" },
                  { day: 12, title: "Annual Scientific Conference" },
                ].map((event) => (
                  <li key={event.day} className="py-3 flex gap-3">
                    <div className="bg-slate-100 text-slate-600 px-3 py-1 text-center rounded-sm h-fit">
                      <span className="block text-xs uppercase font-bold">
                        Oct
                      </span>
                      <span className="block text-xl font-bold">
                        {event.day}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-sm hover:underline cursor-pointer">
                        {event.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Nairobi, Kenya
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

/* ==================================================
   Small Reusable Warning Card
================================================== */

function WarningCard({
  title,
  description,
}: {
  title: string;
  description: string;
  color: "amber" | "yellow";
}) {
  return (
    <div className="p-3 bg-white border-l-4 border-amber-500 shadow-sm">
      <strong className="block mb-1">{title}</strong>
      <span className="text-slate-600">{description}</span>
    </div>
  );
}