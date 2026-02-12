// src/features/products/pages/ProductDetails.tsx

import { PageLayout } from "@/shared/components/layout/PageLayout";

interface Props {
  title: string;
  description: string;
  externalUrl?: string;
}

export default function ProductDetails({
  title,
  description,
  externalUrl,
}: Props) {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-serif font-bold text-primary mb-6">
          {title}
        </h1>

        <p className="mb-8 text-slate-700">{description}</p>

        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-primary text-white rounded hover:opacity-90 transition"
          >
            Visit External Site
          </a>
        )}
      </div>
    </PageLayout>
  );
}
