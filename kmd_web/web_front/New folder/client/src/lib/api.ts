export async function checkBackendHealth() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch("/api/health/", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}
