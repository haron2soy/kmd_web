import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface PageLayoutProps {
  title?: string;
  description?: string;
}

export function PageLayout({ title, description }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <Header />

      {/* Navbar */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <Navbar />
      </div>

      {/* Optional Hero */}
      {title && (
        <section className="bg-gradient-to-b from-slate-100 to-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 lg:py-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-tight mb-3">
              {title}
            </h1>

            {description && (
              <p className="text-base md:text-lg text-slate-600 max-w-3xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <Outlet /> {/* 🔥 THIS is the key */}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}