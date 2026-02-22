/**
 * Central configuration — reads environment variables exposed by Expo
 * (EXPO_PUBLIC_* prefix makes them available in the JS bundle).
 *
 * Never import Rork / Rivet variables here; they have been removed.
 */
export const config = {
  openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "",
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;
