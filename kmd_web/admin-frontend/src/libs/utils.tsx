// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names conditionally and resolves Tailwind conflicts.
 * Example:
 * cn("p-2", isActive && "bg-red-500", "p-4") → "bg-red-500 p-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}