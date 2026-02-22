/**
 * Environment configuration module.
 * Centralizes access to all environment variables used in the app.
 */

export const ENV = {
  // Rork DB
  RORK_DB_ENDPOINT: process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT || '',
  RORK_DB_NAMESPACE: process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE || '',
  RORK_DB_TOKEN: process.env.EXPO_PUBLIC_RORK_DB_TOKEN || '',

  // Supabase
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fkwlgzkglyrmzdbscqbj.supabase.co',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrd2xnemtnbHlybXpkYnNjcWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDUxMTUsImV4cCI6MjA4NTI4MTExNX0.c078nkR2_TJ9b9oPfukp-tI7pXQrosdGPMWJXqeN8Nc',

  // Rork API
  RORK_API_BASE_URL: process.env.EXPO_PUBLIC_RORK_API_BASE_URL || '',
};
