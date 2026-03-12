// NewsList.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Link } from 'wouter';
import { useEffect, useState } from "react";
import { CloudSun } from 'lucide-react'; // add these icons or any you prefer

type NewsItem = {
  id: number;
  slug: string;
  title: string;
  description: string;
  created_at?: string;
  image_url?: string;
};


export default function NewsList() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        setNewsItems(data || []);
      })
      .catch(err => {
        console.error("Failed to fetch news:", err);
        setNewsItems([]); // treat error as no news
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="rounded-sm border-slate-200 shadow-sm animate-pulse">
            <div className="w-full h-48 bg-slate-200" />
            <CardHeader className="p-5 pb-2">
              <div className="h-4 w-20 bg-slate-300 rounded mb-2" />
              <div className="h-7 w-3/4 bg-slate-300 rounded" />
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="h-4 bg-slate-300 rounded mb-2" />
              <div className="h-4 bg-slate-300 rounded mb-4 w-5/6" />
              <div className="h-5 w-32 bg-slate-300 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const hasNews = newsItems.length > 0;

  return (
    <section className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-primary">Latest News & Updates</h2>

      {hasNews ? (
        <div className="grid md:grid-cols-2 gap-6">
          {newsItems.map((item) => (
            <Card 
              key={item.id} 
              className="rounded-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <img
                src={item.image_url || "/fallback.jpg"}
                alt={item.title}
                className="w-full h-48 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/fallback.jpg"; }}
              />

              <CardHeader className="p-5 pb-2">
                <div className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-sm mb-2 w-fit">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                </div>

                <CardTitle className="font-serif text-xl text-primary line-clamp-2">
                  {item.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 pt-2">
                <p className="text-slate-600 line-clamp-3 mb-4">
                  {item.description}
                </p>

                <Link href={`/news/${item.slug}`}>
                  <span className="text-sm font-bold text-primary hover:text-accent cursor-pointer">
                    Read Full Story →
                  </span>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-sm border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-white">

          <CardHeader className="p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <CloudSun className="h-6 w-6 text-primary" />
              <CardTitle className="font-serif text-xl text-primary">
                No News Updates Today
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-6 text-center space-y-4">
            
            <p className="text-slate-600">
              Our teams continuously monitor weather and climate conditions across
              the region. If significant developments occur, updates will appear
              here promptly.
            </p>

            <div className="pt-4 border-t border-slate-100 text-sm text-slate-500">
              For routine forecasts and warnings, please refer to the
              <span className="font-medium text-primary"> Weather Forecast </span>
              and
              <span className="font-medium text-primary"> Alerts & Warnings </span>
              sections.
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}