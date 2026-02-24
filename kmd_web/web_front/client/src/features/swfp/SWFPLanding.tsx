// src/features/swfp/SWFPLanding.tsx
import { Link } from "wouter";
import { PageLayout } from "@/shared/components/layout/PageLayout";
import { useScrollToHeader } from "../../shared/components/ScrollToHeader/useScrollToHeader";
const Card = ({ href, label }: { href: string; label: string }) => (
  <Link href={href}>
    <div className="group p-6 border rounded-lg bg-white hover:shadow-md hover:border-primary/40 transition">
      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary">
        {label}
      </h3>
    </div>
  </Link>
);

const links = [
  { href: "/swfp-evaluation/quarterly-report", label: "Quarterly Report" },
  { href: "/swfp-evaluation/event-table", label: "Event Table" },
];

export default function SWFPLanding() {
    const { headerRef } = useScrollToHeader(80);
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header ref={headerRef} className="mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
            SWFP Evaluation
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Access SWFP evaluation tools including Quarterly report and event datasets.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <Card key={l.href} {...l} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}