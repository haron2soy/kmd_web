import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import apiClient from "@/lib/apiClient";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";

interface PageData {
  title: string;
  content: string;
  created_at: string;
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    apiClient
      .get(`/pages/${slug}/`)
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        console.error("Failed to fetch page", err);
        setError(
          "The page you requested could not be found or is currently unavailable."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
        {loading ? (
          <Skeleton className="h-10 w-2/3 max-w-lg" />
        ) : (
          data?.title || "Page Not Found"
        )}
      </h1>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm text-slate-500">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="capitalize">
          {slug?.replace(/-/g, " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="h-8" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div
                className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: data?.content || "" }}
              />

              {data?.created_at && (
                <div className="mt-10 pt-6 border-t border-slate-200 text-sm text-slate-500">
                  Published on{" "}
                  {new Date(data.created_at).toLocaleString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-sm sticky top-24">
            <h3 className="font-serif font-bold text-lg text-primary mb-4 pb-2 border-b border-slate-200">
              Related Links
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/pages/about-rsmc" className="text-sm font-medium text-slate-700 hover:text-accent">
                About RSMC
              </Link>
              <Link href="/pages/mandate" className="text-sm font-medium text-slate-700 hover:text-accent">
                Our Mandate
              </Link>
              <Link href="/pages/services" className="text-sm font-medium text-slate-700 hover:text-accent">
                Services
              </Link>
              <Link href="/contact" className="text-sm font-medium text-slate-700 hover:text-accent">
                Contact Us
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}