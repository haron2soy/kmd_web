import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useScrollToHeader } from "@/shared/components/ScrollToHeader/useScrollToHeader";

export default function ForecastLanding() {
  const { headerRef } = useScrollToHeader([], 80);

  const [images, setImages] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Fetch images
  useEffect(() => {
    fetch("/api/forecasts/short-range/")
      .then(res => res.json())
      .then(data => {
        if (data?.images) {
          const processed = data.images.map((item: any) =>
            `/uploads/${item.image}`.replace(/\/+/g, "/")
          );
          setImages(processed);
        }
      });
  }, []);

  // Auto slide
  useEffect(() => {
    if (!isPlaying || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, images]);

  const nextSlide = () => {
    setCurrent(prev => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent(prev => (prev - 1 + images.length) % images.length);
  };

  const QuickLinks = [
    
    { href: "/forecasts/risk-table-short", label: "Short-Range Risk Table" },
    { href: "/forecasts/discussion-short", label: "Short-Range Discussion" },
    { href: "/forecasts/risk-table-medium", label: "Medium-Range Risk Table" },
    { href: "/forecasts/discussion-medium", label: "Medium-Range Discussion" },
    { href: "/guidance", label: "Guidance" },
    { href: "/nwp-models", label: "NWP Models" },
    { href: "/forecasts/archive", label: "Forecast Archive" },
  ];

  return (
    <div className="mx-auto px-4 max-w-7xl">


      {/* ✅ RESPONSIVE GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">

        {/* SIDEBAR */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-20">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                {QuickLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className="py-1 px-3 rounded hover:bg-orange-50 hover:text-orange-600 cursor-pointer">
                      {link.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ✅ SLIDER */}
        <div className="lg:col-span-9 w-full flex flex-col">
          <header ref={headerRef} className="mb-6">
            <h1 className="text-xl font-serif font-bold text-primary">
              Forecasts
            </h1>
          </header>
          {/* IMAGE CONTAINER */}
          <div
            className="w-full flex-1 bg-white border rounded-xl overflow-hidden bg-white border rounded-xl flex items-center justify-center overflow-hidden"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
          >
            {images.length > 0 ? (
              <img
                src={images[current]}
                className="w-full h-full object-contain"
                alt={`Forecast ${current + 1}`}
              />
            ) : (
              <span className="text-gray-500">Loading...</span>
            )}
          </div>

          {/* CONTROLS */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <button
              onClick={prevSlide}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              {"<"}
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-1 bg-primary text-white rounded"
            >
              {isPlaying ? "||" : "▶"}
            </button>

            <button
              onClick={nextSlide}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              {">"}
            </button>

            <span className="ml-2 text-gray-600 text-sm">
              {images.length > 0 ? `${current + 1} / ${images.length}` : ""}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}