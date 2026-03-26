import React from 'react';
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
      
      {/* Header + Navbar */}
      <Header />
      <Navbar />

      {/* Hero Section */}
      {title && (
        <div className="bg-gradient-to-b from-slate-100 to-white border-b border-slate-200">
          <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-10 md:py-12 lg:py-14 xl:py-16">
            
            <h1 className="
              text-xl 
              sm:text-2xl 
              md:text-3xl 
              lg:text-3xl 
              xl:text-4xl 
              font-serif font-bold text-primary tracking-tight
            ">
              {title}
            </h1>

            {description && (
              <p className="
                mt-3 
                text-sm 
                sm:text-base 
                md:text-lg 
                lg:text-xl 
                text-slate-700 
                max-w-3xl 
                leading-relaxed
              ">
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <div className="
          mx-auto 
          w-full 
          max-w-screen-2xl 
          px-4 
          sm:px-6 
          lg:px-8 
          xl:px-10 
          py-4 
          sm:py-6 
          md:py-8 
          lg:py-10
        ">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}