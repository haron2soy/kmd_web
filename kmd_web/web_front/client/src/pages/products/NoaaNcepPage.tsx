import { useEffect, useState } from "react"

export default function NoaaNcepPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/products/noaa-ncep/`)
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <p>Loading…</p>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">{data.name}</h1>
      <p>{data.description}</p>
    </div>
  )
}
