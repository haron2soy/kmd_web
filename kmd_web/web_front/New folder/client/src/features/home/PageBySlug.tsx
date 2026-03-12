import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import apiClient from "@/lib/apiClient"

export default function PageBySlug() {
  const { slug } = useParams()
  const [page, setPage] = useState<any>(null)

  useEffect(() => {
    apiClient.get(`/pages/${slug}`).then(res => setPage(res.data))
  }, [slug])

  if (!page) return <p>Loading…</p>

  return (
    <div className="prose max-w-none"
         dangerouslySetInnerHTML={{ __html: page.content }}
    />
  )
}
