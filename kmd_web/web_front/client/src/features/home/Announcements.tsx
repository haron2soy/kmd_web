import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { fetchClient } from '@/lib/fetchClient';
import { useEffect, useState } from 'react';

type AnnouncementItem = {
  id: number;
  title: string;
  slug: string;
  message: string;
  start_at: string;
  end_at?: string;
  priority?: number;
};

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const MAX_CHARS = 120;

  useEffect(() => {
    fetchClient('/api/announcements/active')
      .then((res) => res.json())
      .then((data) => setAnnouncements(data || []))
      .catch((err) => {
        console.error('Failed to fetch announcements:', err);
        setAnnouncements([]); // treat error as no announcements
      });
  }, []);

  const hasAnnouncements = announcements.length > 0;

  return (
    <div className="space-y-6">
      {hasAnnouncements ? (
        announcements.map((item) => {
          const isExpanded = expandedId === item.id;
          const isLong = item.message.length > MAX_CHARS;

          return (
            <Card
              key={item.id}
              className="rounded-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="p-5 pb-2">
                <CardTitle className="font-serif text-xl text-primary leading-tight">
                  {item.title}
                </CardTitle>

                <div className="text-xs text-slate-500">
                  {new Date(item.start_at).toLocaleDateString()}
                  {item.end_at
                    ? ` - ${new Date(item.end_at).toLocaleDateString()}`
                    : ''}
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-2">
                <p className="text-slate-600 mb-3 leading-relaxed">
                  {isExpanded || !isLong
                    ? item.message
                    : item.message.slice(0, MAX_CHARS) + '...'}
                </p>

                {isLong && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : item.id)
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors underline underline-offset-2 hover:no-underline"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                    <span className="text-xs opacity-70">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card className="rounded-sm border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <CardHeader className="p-6 pb-4 border-b border-slate-100">
            <CardTitle className="font-serif text-xl text-primary">
              No Announcements Today
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-slate-600">
              There are no active announcements at the moment. Check back later for updates from our meteorological team.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}