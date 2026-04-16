import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export type DbRankingEntry = {
  id: string;
  nickname: string;
  school: string;
  category: string;
  result_type: string;
  elapsed: number;
  minutes: number;
  created_at: string;
};
