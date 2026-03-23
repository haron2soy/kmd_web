import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useScrollToHeader } from "@/shared/components/ScrollToHeader/useScrollToHeader";

export default function ForecastLanding() {
  const { headerRef } = useScrollToHeader(80);

  const [images, setImages] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // ✅ Fetch ALL images from directory
  useEffect(() => {
    fetch("/api/forecasts/short-range/")
      .then(res => res.json())
      .then(data => {
        if (data?.images) {
          const processed = data.images.map((item: any) =>
            item.image.replace(
              /\/?rsmc\/(\d{4})\/(\d{2})\/(\d{2})\//,
              (_: string, y: string, m: string, d: string) =>
                `/uploads/rsmc/${y}/${m}/${d}/`
            )
          );

      setImages(processed);
    }
  });
  }, []);

  // ✅ Auto slide
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

  // Sidebar (exact as you requested)
  const relatedLinks = [
    { href: "/forecasts/risk-table-medium", label: "Medium-Range Risk Table" },
    { href: "/forecasts/discussion-medium", label: "Medium-Range Discussion" },
    { href: "/forecasts/archive", label: "Forecast Archive" },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header ref={headerRef} className="mb-6">
        <h1 className="text-xl md:text-xl font-serif font-bold text-primary mb-4">
          Forecasts
        </h1>
      </header>

      <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* LEFT SIDEBAR */}
            <aside className="lg:col-span-3 mt-10 lg:mt-0">
              <div className="sticky top-32">
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">
                    Related Links
                  </h3>
                  <div className="space-y-2">
                    {relatedLinks.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <div className="py-2 px-3 rounded hover:bg-orange-50 hover:text-orange-600 cursor-pointer">
                          {link.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
        {/* SLIDER */}
        <div className="lg:col-span-4 flex flex-col items-center mx-auto">

          <div
            className="w-full h-[400px] bg-white border rounded-xl flex items-center justify-center overflow-hidden"
            onMouseEnter={() => setIsPlaying(false)}   // ✅ pause on hover
            onMouseLeave={() => setIsPlaying(true)}   // ✅ resume
          >
            {images.length > 0 ? (
              <img
                src={images[current]}
                className="max-h-full max-w-full object-contain"
                alt={`Forecast ${current + 1}`}
              />
            ) : (
              <span className="text-gray-500">Loading...</span>
            )}
          </div>

          {/* ✅ CONTROLS BELOW */}
          <div className="mt-4 flex items-center gap-3">

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

            <span className="ml-3 text-gray-600">
              {images.length > 0 ? `${current + 1} / ${images.length}` : ""}
            </span>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-3 mt-10 lg:mt-0">
          <div className="sticky top-32">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Related Links
              </h3>

              <div className="space-y-2">
                {relatedLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className="py-2 px-3 rounded hover:bg-orange-50 hover:text-orange-600 cursor-pointer">
                      {link.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}