import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Link } from 'wouter';
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => setNewsItems(data))
      .catch(err => console.error("Failed to fetch news:", err));
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {newsItems.map((item) => (
        <Card key={item.id} className="rounded-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          
          <img
            src={item.image_url || "/fallback.jpg"}
            alt={item.title}
            className="w-full h-48 object-cover"
          />

          <CardHeader className="p-5 pb-2">
            <div className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-sm mb-2 w-fit">
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </div>

            <CardTitle className="font-serif text-xl text-primary">
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
  );
}