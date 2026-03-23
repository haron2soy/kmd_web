// src/features/products/api.ts

import apiClient from "@/lib/apiClient";

export interface Product {
  slug: string;
  title: string;
  description: string;
  category: "regional" | "global";
  external_url?: string;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get("/products/");
  return response.data;
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const response = await apiClient.get(`/products/${slug}/`);
  return response.data;
};
