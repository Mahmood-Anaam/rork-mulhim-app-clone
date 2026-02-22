# Architecture Guide — Mulhim App

## Overview

Mulhim follows a **feature-based layered architecture** designed for maintainability, testability, and scalability.

```
┌─────────────────────────────────────────────────────────────┐
│                        Screens (app/)                        │
│          Expo Router • file-based routing • thin UI          │
├──────────────────────────┬──────────────────────────────────┤
│     Components           │           Hooks                  │
│  (components/)           │         (hooks/)                 │
│  Reusable UI pieces      │  Business logic extraction       │
├──────────────────────────┴──────────────────────────────────┤
│                      Providers (providers/)                  │
│         AuthProvider • FitnessProvider • LanguageProvider    │
├─────────────────────────────────────────────────────────────┤
│                  Service Layer (lib/)                        │
│        supabase.ts • remoteFitnessRepo.ts • trpc.ts          │
├─────────────────────────────────────────────────────────────┤
│                  External Services                           │
│     Supabase (PostgreSQL) • OpenAI • AsyncStorage            │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Descriptions

### 1. Screens (`app/`)

Expo Router file-based screens. Screens are **thin** — they:
- Import and compose components
- Use hooks for business logic
- Handle navigation

| Screen | Path |
|--------|------|
| Entry point / redirect | `app/index.tsx` |
| Language selection | `app/welcome.tsx` |
| Account prompt | `app/account-prompt.tsx` |
| User onboarding | `app/onboarding.tsx` |
| Login | `app/auth/login.tsx` |
| Sign up | `app/auth/signup.tsx` |
| Workout plan (tab) | `app/(tabs)/plan.tsx` |
| Nutrition (tab) | `app/(tabs)/nutrition.tsx` |
| AI Coach (tab) | `app/(tabs)/coach.tsx` |
| Profile (tab) | `app/(tabs)/profile.tsx` |
| Workout detail | `app/workout-details.tsx` |
| Meal detail | `app/meal-details.tsx` |

### 2. Components (`components/`)

Organized by feature, with shared primitives in `ui/`.

```
components/
├── ui/
│   ├── Button.tsx         Primary/secondary/danger button
│   ├── Card.tsx           Elevated card container
│   ├── LoadingScreen.tsx  Full-screen loading indicator
│   └── StatBox.tsx        Icon + value + label stat widget
├── plan/
│   ├── ExerciseItem.tsx   Single exercise row
│   └── WeekProgressCard.tsx  Weekly progress bar
├── nutrition/
│   ├── MacroSummaryCard.tsx  Calorie + macro display
│   └── MealCard.tsx          Meal row with completion toggle
├── coach/
│   └── ChatMessage.tsx    AI chat bubble
└── profile/
    └── ProfileStats.tsx   Row of stat boxes
```

### 3. Hooks (`hooks/`)

Custom hooks extract and centralize business logic.

| Hook | Purpose |
|------|---------|
| `useProgressStats` | Derived stats (BMI, weight change, streak) |
| `usePlanGeneration` | Workout plan AI generation algorithm |
| `useMealPlan` | Meal plan operations and derived metrics |

### 4. Providers (`providers/`)

React Context providers that manage global app state.

#### `AuthProvider`
- Manages Supabase authentication session
- Exposes: `user`, `session`, `isAuthenticated`, `signIn`, `signUp`, `signOut`

#### `FitnessProvider`
- Central state for all fitness data
- **Boot sequence:**
  1. Hydrate from `AsyncStorage` (fast, offline-first)
  2. Fetch from Supabase (background sync)
  3. Push local-only data to Supabase if user just signed in
- Exposes: `profile`, `currentWeekPlan`, `currentMealPlan`, `progress`, etc.

#### `LanguageProvider`
- Manages Arabic/English language selection
- Persists to `AsyncStorage`
- Sets RTL layout direction for Arabic

### 5. Service Layer (`lib/`)

#### `supabase.ts`
Supabase client initialized with env vars. Uses `AsyncStorage` as the session storage for React Native.

#### `remoteFitnessRepo.ts`
Data access layer for all Supabase operations:
- `upsertProfile`, `fetchProfile`
- `insertProgressEntry`, `fetchProgressEntries`
- `insertWorkoutLog`, `fetchWorkoutLogs`
- `saveWorkoutPlan`, `fetchActiveWorkoutPlan`
- `saveNutritionPlan`, `fetchActiveNutritionPlan`
- `addFavoriteExercise`, `removeFavoriteExercise`, `fetchFavoriteExercises`
- `addFavoriteMeal`, `removeFavoriteMeal`, `fetchFavoriteMeals`

Features: retry logic (2 retries for network errors), network error handling, batch inserts for exercises.

#### `trpc.ts`
tRPC client for the Hono backend. Falls back to `localhost:3000` if `EXPO_PUBLIC_RORK_API_BASE_URL` is not set.

---

## Data Flow

### Authentication Flow

```
App launch
    │
    ▼
AuthProvider.getSession()
    │
    ├─ Session found ──► FitnessProvider.loadData(user)
    │                         │
    │                         ├─ Load AsyncStorage (instant)
    │                         └─ Sync with Supabase (background)
    │
    └─ No session ──► FitnessProvider.loadData(null)
                           │
                           └─ Load AsyncStorage only
```

### Onboarding Flow

```
app/index.tsx
    │
    ├─ No language selected ──► /welcome (language picker)
    │
    ├─ User logged in + has profile ──► /(tabs)/plan
    │
    ├─ User logged in + no profile ──► /onboarding
    │
    ├─ Guest + has local profile ──► /(tabs)/plan
    │
    └─ No user + no profile ──► /account-prompt
                                    │
                                    ├─ Login ──► /auth/login
                                    └─ Skip  ──► /onboarding
```

### Data Sync Strategy

The app uses an **offline-first** strategy:

1. **Read:** Always read from local state (AsyncStorage) first for instant rendering
2. **Write:** Write to AsyncStorage immediately, then sync to Supabase asynchronously
3. **Conflict resolution:** Supabase data takes precedence on app boot (remote is source of truth for authenticated users)

---

## Database Schema

See [`supabase-migration.sql`](../../supabase-migration.sql) for the complete schema.

### Entity Relationship

```
auth.users (Supabase managed)
    │
    ├── user_profiles (1:1)
    ├── progress_entries (1:N)
    ├── workout_logs (1:N)
    │   └── exercise_logs (1:N)
    ├── workout_plans (1:N)
    │   └── workout_sessions (1:N)
    │       └── exercises (1:N)
    ├── nutrition_plans (1:N)
    │   └── meal_plans (1:N)
    │       └── meals (1:N)
    ├── favorite_exercises (1:N)
    └── favorite_meals (1:N)
```

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `EXPO_PUBLIC_OPENAI_API_KEY` | ✅ | OpenAI key for AI coach |
| `EXPO_PUBLIC_RORK_API_BASE_URL` | ⬜ Optional | Rork cloud API URL (falls back to localhost) |
| `EXPO_PUBLIC_RORK_DB_ENDPOINT` | ⬜ Optional | Rivet DB endpoint |
| `EXPO_PUBLIC_RORK_DB_NAMESPACE` | ⬜ Optional | Rivet DB namespace |
| `EXPO_PUBLIC_RORK_DB_TOKEN` | ⬜ Optional | Rivet DB token |
