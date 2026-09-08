import { createClient } from "@supabase/supabase-js";

// Service-role client for server-side (API route) use only. Never import from client components.
export function supabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export type Card = {
  id: number;
  quote: string;
  author: string | null;
  image_path: string;
  position: number;
  status: "ready" | "posted";
  posted_platforms: string[];
  created_at: string;
  posted_at: string | null;
};
