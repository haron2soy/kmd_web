import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

interface Stats {
  users: number;
  posts: number;
}

function App() {
  const [stats, setStats] = useState<Stats | null>(null);

  // Fetch admin stats from Django API
  useEffect(() => {
    axios
      .get("https://admin.site.com/api/admin/stats/", { withCredentials: true })
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
      </header>

      <main className="admin-main">
        <div className="cards">
          <div className="card">
            <h2>Users</h2>
            <p>{stats?.users ?? "Loading..."}</p>
          </div>
          <div className="card">
            <h2>Posts</h2>
            <p>{stats?.posts ?? "Loading..."}</p>
          </div>
        </div>

        {/* Add more admin sections here */}
      </main>
    </div>
  );
}

export default App;