import Constants from 'expo-constants';

export const CONFIG = {
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  RORK_API_BASE_URL: process.env.EXPO_PUBLIC_RORK_API_BASE_URL || '',
};

if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials are missing. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.');
}

if (!CONFIG.OPENAI_API_KEY) {
  console.warn('OpenAI API Key is missing. Ensure EXPO_PUBLIC_OPENAI_API_KEY is set.');
}
