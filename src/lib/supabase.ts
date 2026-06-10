import { createClient } from "@supabase/supabase-js";

// Read from client-side Vite environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

// Export the real Supabase client if configured, otherwise null
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Utility functions with local fallback for full-stack preview synchronicity
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};
