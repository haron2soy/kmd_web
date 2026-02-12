import { PageLayout } from '@/shared/components/layout/PageLayout';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <PageLayout>
      {/* Page Header */}
      <div className="bg-slate-100 border-b border-slate-200 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">
            {title}
          </h1>
          <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
             <span>Home</span>
             <span>/</span>
             <span className="capitalize">{title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-2xl mx-auto bg-slate-50 p-12 border border-slate-200 rounded-sm">
          <h2 className="text-2xl font-serif text-slate-400 mb-4">Under Construction</h2>
          <p className="text-slate-600 mb-6">
            The <strong>{title}</strong> section is currently being updated with the latest institutional data. 
            Please check back shortly.
          </p>
          <div className="space-y-3 max-w-sm mx-auto">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mx-auto" />
            <Skeleton className="h-4 w-4/6 mx-auto" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
