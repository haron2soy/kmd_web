import { useParams } from "wouter";
import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

// Define the page type
interface PageData {
  title: string;
  content: string;
  [key: string]: any; // for any other fields
}

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);

  useEffect(() => {
    if (!slug) return;

    apiClient
      .get(`/pages/${slug}/`)
      .then(res => setPage(res.data))
      .catch(console.error);
  }, [slug]);

  if (!page) return <div>Loading...</div>;

  return (
    <div>
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}