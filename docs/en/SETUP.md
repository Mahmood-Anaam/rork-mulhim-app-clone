# Setup Guide

## Quick Start

### 1. System Requirements

| Requirement | Version |
|---|---|
| Node.js | v18+ |
| npm | v9+ (or Bun v1+) |
| Git | v2+ |
| Expo Go (mobile) | Latest |

### 2. Clone & Install

```bash
git clone https://github.com/Mahmood-Anaam/rork-mulhim-app-clone.git
cd rork-mulhim-app-clone
npm install --legacy-peer-deps
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
EXPO_PUBLIC_RORK_DB_ENDPOINT="https://api.rivet.dev"
EXPO_PUBLIC_RORK_DB_NAMESPACE="your-namespace"
EXPO_PUBLIC_RORK_DB_TOKEN="your-token"
EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase-migration.sql`
4. Execute the SQL to create all tables, indexes, and RLS policies

### 5. Run the App

```bash
# Development server (mobile)
npm start

# Web preview
npm run start-web
```

### 6. Test on Device

1. Install **Expo Go** on your phone
2. Scan the QR code from the terminal
3. The app loads on your device

## Database Tables Created

After running the migration, these tables are available:

- `user_profiles` - User fitness profiles
- `workout_plans` - Generated workout plans
- `workout_sessions` - Daily workout sessions
- `exercises` - Individual exercises
- `workout_logs` - Completed workout records
- `exercise_logs` - Exercise completion records
- `progress_entries` - Weight tracking
- `nutrition_plans` - Nutrition plans
- `meal_plans` - Daily meal plans
- `meals` - Individual meals
- `favorite_exercises` - Saved exercises
- `favorite_meals` - Saved meals

## Verifying the Setup

1. **TypeScript Check**: `npx tsc --noEmit` (should pass with no errors)
2. **Lint Check**: `npx expo lint` (should pass)
3. **App Loads**: The welcome screen should appear when opening the app
4. **Supabase Connection**: Sign up with a test email; check Supabase Auth dashboard for the new user
