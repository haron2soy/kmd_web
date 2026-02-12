// src/features/products/pages/ProductsLanding.tsx
import { Link } from "wouter";
import { PageLayout } from "@/shared/components/layout/PageLayout";

// Optional: if you want card-like styling consistency
const ProductCard = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href}>
    <div className="group relative p-6 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary/40 transition-all duration-200 bg-white">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">
        {children}
      </h3>
    </div>
  </Link>
);

export default function ProductsLanding() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-10">
          Products
        </h1>

        {/* Regional */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Regional Products
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ProductCard href="/products/uk-tephigrams">
              UK Met Office Tephigrams
            </ProductCard>

            <ProductCard href="/products/uk-eps">
              UK Met Office EPS
            </ProductCard>

            <ProductCard href="/products/lake-victoria">
              Lake Victoria Products
            </ProductCard>
          </div>
        </section>

        {/* Global */}
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Global Products
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ProductCard href="/products/noaa-ncep">
              NOAA NCEP African Desk
            </ProductCard>

            <ProductCard href="/products/uk-africa-vcp">
              UK Africa VCP
            </ProductCard>

            {/* 
              Future-proof: leave empty grid cell or add later products 
              <div className="hidden lg:block" /> 
            */}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}