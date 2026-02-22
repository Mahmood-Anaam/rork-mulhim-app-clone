/**
 * Environment configuration module.
 * Centralizes access to all environment variables used in the app.
 * All values must be provided via .env file. See .env.example for reference.
 */

export const ENV = {
  // Rork DB
  RORK_DB_ENDPOINT: process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT || '',
  RORK_DB_NAMESPACE: process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE || '',
  RORK_DB_TOKEN: process.env.EXPO_PUBLIC_RORK_DB_TOKEN || '',

  // Supabase
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',

  // Rork API
  RORK_API_BASE_URL: process.env.EXPO_PUBLIC_RORK_API_BASE_URL || '',
};
