# Setup Guide — Local Development

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | [nvm](https://github.com/nvm-sh/nvm) |
| Bun | ≥ 1.0 | [bun.sh](https://bun.sh) |
| Expo CLI | latest | `npm install -g expo` |
| Git | any | system package |

**Optional (for device simulators):**
- macOS + Xcode ≥ 15 (iOS Simulator)
- Android Studio (Android Emulator)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Mahmood-Anaam/rork-mulhim-app-clone.git
cd rork-mulhim-app-clone
```

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env   # if the example file exists
# or create it manually:
```

```env
# Required
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Required for AI Coach
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...

# Optional — Rork cloud (leave empty for local dev)
EXPO_PUBLIC_RORK_API_BASE_URL=

# Optional — Rivet DB (leave empty if not using)
EXPO_PUBLIC_RORK_DB_ENDPOINT=
EXPO_PUBLIC_RORK_DB_NAMESPACE=
EXPO_PUBLIC_RORK_DB_TOKEN=
```

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

### 4. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** in your project dashboard
3. Copy and run the contents of `supabase-migration.sql`
4. Update your `.env` with the project URL and anon key

---

## Running the App

### Web (browser preview — recommended for quick testing)

```bash
bun run web
# or
npx expo start --web
```
Opens at `http://localhost:8081` (or the next available port).

### Expo Go (physical device)

1. Install **Expo Go** from the App Store / Google Play
2. Run:
   ```bash
   bun run start
   ```
3. Scan the QR code shown in the terminal with your phone camera (iOS) or the Expo Go app (Android)

### iOS Simulator (macOS only)

```bash
bun run ios
# or
npx expo start --ios
```

### Android Emulator

```bash
bun run android
# or
npx expo start --android
```

---

## Development Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `expo start` | Start Expo DevTools |
| `web` | `expo start --web` | Web preview |
| `ios` | `expo start --ios` | iOS Simulator |
| `android` | `expo start --android` | Android Emulator |
| `lint` | `expo lint` | Run ESLint |
| `start:rork` | `bunx rork start ...` | Rork cloud preview (requires Rork CLI) |

---

## Troubleshooting

### App doesn't start

```bash
# Clear Metro cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules
bun install
```

### Supabase connection errors

- Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Check that the database tables exist by running `supabase-migration.sql`
- Ensure Row Level Security policies are applied

### TypeScript errors

```bash
npx tsc --noEmit
```

### AI Coach not responding

- Verify `EXPO_PUBLIC_OPENAI_API_KEY` is valid and has sufficient credits
- The AI coach requires an internet connection

---

## Supabase Setup Details

### Required Tables (created by `supabase-migration.sql`)

- `user_profiles` — user fitness profile
- `progress_entries` — weight tracking entries
- `workout_logs` — completed workout sessions
- `exercise_logs` — individual exercises in a workout log
- `workout_plans` — AI-generated weekly workout plans
- `workout_sessions` — individual sessions in a plan
- `exercises` — exercises in a session
- `nutrition_plans` — AI-generated nutrition plans
- `meal_plans` — daily meal plans
- `meals` — individual meals in a day
- `favorite_exercises` — saved favorite exercises
- `favorite_meals` — saved favorite meals

### Row Level Security

All tables have RLS enabled. Users can only read/write their own data. This is enforced at the database level.

### Authentication

The app uses Supabase Email/Password authentication. No OAuth setup is required.

To enable email confirmation (optional):
1. Go to Supabase Dashboard → Authentication → Settings
2. Toggle "Enable email confirmations"

---

## Production Deployment

### EAS Build (iOS/Android)

```bash
npm install -g @expo/eas-cli
eas login
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Web Deployment

```bash
# Build static web app
npx expo export --platform web

# Deploy to any static hosting (Vercel, Netlify, etc.)
```
