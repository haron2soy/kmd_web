//import React from 'react';
import { Header } from './Header';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function PageLayout({ children, title, description }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Site-wide top bar / branding */}
      <Header />
      <Navbar />

      {/* Page-specific hero section – only when title exists */}
      {title && (
        <div className="bg-gradient-to-b from-slate-100 to-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-10 md:py-14 lg:py-16">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-primary tracking-tight mb-4">
              {title}
            </h1>
            {description && (
              <p className="mt-3 md:mt-4 text-lg md:text-xl text-slate-700 max-w-3xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main content area */}
      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
}