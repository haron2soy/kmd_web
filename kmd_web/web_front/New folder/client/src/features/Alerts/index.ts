// src/types/index.ts
export interface Warning {
  id: number;
  title: string;
  slug: string;
  warning_type: string;
  message: string;
  start_at: string;
  end_at: string | null;
  is_active: boolean;
  priority: number;
  icon: string;   // from Django property
  color: string;  // Tailwind color name from Django property
}