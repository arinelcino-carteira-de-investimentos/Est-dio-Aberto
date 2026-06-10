import { createClient } from "@supabase/supabase-js";

// Read from client-side Vite environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "https://joisyptnrfviembbeoxj.supabase.co";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaXN5cHRucmZ2aWVtYmJlb3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDY5NjIsImV4cCI6MjA5NjYyMjk2Mn0.cS5OrMuYfEWel836nTKDx2BgNDchQ8ZSnVLNMVgArSo";

// Export the real Supabase client if configured, otherwise null
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Utility functions with local fallback for full-stack preview synchronicity
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};
