import { useEffect, useState } from "react";
import { useRoute } from "wouter";

type NewsDetailType = {
  title: string;
  content: string;
  image_url?: string;
  created_at?: string;
};

export default function NewsDetail() {
  const [match, params] = useRoute<{ slug: string }>("/news/:slug");
  const [news, setNews] = useState<NewsDetailType | null>(null);



    useEffect(() => {
    if (match && params?.slug) {
        fetch(`/api/news/${params.slug}`)
        .then(res => res.json())
        .then(data => setNews(data))
        .catch(err => console.error("Failed to fetch news detail:", err));
    }
    }, [match, params?.slug]);

  if (!news) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {news.image_url && (
        <img
          src={news.image_url}
          alt={news.title}
          className="w-full h-64 object-cover mb-4"
        />
      )}

      <h1 className="text-2xl font-bold mb-2">{news.title}</h1>

      <div className="text-sm text-slate-500 mb-4">
        {news.created_at && new Date(news.created_at).toLocaleDateString()}
      </div>

      <div className="prose">{news.content}</div>
    </div>
  );
}