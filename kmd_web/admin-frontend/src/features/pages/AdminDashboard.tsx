import { useEffect, useState } from "react";
import axios from "axios";

interface Stats {
  users: number;
  posts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://admin.site.com/api/admin/stats/", {
        withCredentials: true,
      })
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching stats:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to admin.site.com!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-xl shadow border">
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-2xl mt-2">
            {loading ? "Loading..." : stats?.users ?? "-"}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow border">
          <h2 className="text-lg font-semibold">Posts</h2>
          <p className="text-2xl mt-2">
            {loading ? "Loading..." : stats?.posts ?? "-"}
          </p>
        </div>
      </div>
    </div>
  );
}