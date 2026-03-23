import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

type EventItem = {
  id: number;
  slug: string;
  title: string;
  location: string;
  start_date: string;
};

export default function Events() {

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events/upcoming/")
      .then(res => res.json())
      .then(data => {
        setEvents(data || []);
      })
      .catch(err => {
        console.error("Failed to fetch events:", err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">

      <h3 className="font-serif font-bold text-xl text-primary mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-accent" />
        Upcoming Events
      </h3>

      {loading ? (
        <p className="text-sm text-slate-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-slate-500">No upcoming events.</p>
      ) : (
        <ul className="divide-y divide-slate-100">

          {events.map((event) => {

            const date = new Date(event.start_date);

            const month = date.toLocaleString("default", { month: "short" });
            const day = date.getDate();

            return (
              <li key={event.id} className="py-3 flex gap-3">

                <div className="bg-slate-100 text-slate-600 px-3 py-1 text-center rounded-sm h-fit">
                  <span className="block text-xs uppercase font-bold">
                    {month}
                  </span>

                  <span className="block text-xl font-bold">
                    {day}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-primary text-sm hover:underline cursor-pointer">
                    {event.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    {event.location}
                  </p>
                </div>

              </li>
            );

          })}

        </ul>
      )}

    </div>
  );
}