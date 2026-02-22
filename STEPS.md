# STEPS.md — Detailed Implementation Log

> This document records every step taken during the refactoring and documentation of the **Mulhim** (ملهم) fitness app, including justifications, goals, and technical decisions.

---

## Step 1 — Project Exploration & Understanding

**Date:** 2026-02-22  
**Status:** ✅ Completed

### Actions Taken
- Read all source files including:
  - `package.json` (scripts, dependencies)
  - `app.json` (Expo config)
  - All screens under `app/` and `app/(tabs)/`
  - All providers (`AuthProvider`, `FitnessProvider`, `LanguageProvider`)
  - `lib/supabase.ts`, `lib/trpc.ts`, `lib/remoteFitnessRepo.ts`
  - `types/fitness.ts`, `constants/colors.ts`, `constants/translations.ts`
  - `data/exercises.ts`, `data/meals.ts`
  - `supabase-migration.sql`
  - `backend/` (Hono server, tRPC router)

### Key Findings

| Issue | Severity | Description |
|-------|----------|-------------|
| Missing `.env` file | 🔴 Critical | No environment variable file present; credentials hardcoded |
| Hardcoded Supabase keys | 🔴 Critical | `lib/supabase.ts` has credentials inline |
| tRPC crash on startup | 🔴 Critical | `lib/trpc.ts` throws if `EXPO_PUBLIC_RORK_API_BASE_URL` is missing |
| Non-standard start scripts | 🟡 High | `package.json` uses `bunx rork` which requires Rork CLI – unusable locally |
| Incomplete SQL schema | 🟡 High | `supabase-migration.sql` only creates 3 simple tables; `remoteFitnessRepo.ts` uses 12 tables |
| Large monolithic screens | 🟡 High | `nutrition.tsx` (2844 lines), `plan.tsx` (1757 lines) contain all logic + UI inline |
| No documentation | 🟡 High | No `docs/` folder, no setup guide, no architecture docs |

### Architecture Assessment

The app follows Expo Router file-based routing with 4 main tabs:
- **Plan** – AI-generated weekly workout plan
- **Nutrition** – Meal planning with Saudi food database
- **Coach** – AI chat assistant powered by `@rork-ai/toolkit-sdk` (OpenAI)
- **Profile** – User stats and settings

Data flow:
```
Supabase (cloud) ←→ remoteFitnessRepo ←→ FitnessProvider (Context) ←→ Screens
                                      ↑
                                AsyncStorage (local cache / offline)
```

---

## Step 2 — Environment & Configuration Fixes

**Date:** 2026-02-22  
**Status:** ✅ Completed  
**Commit:** `fix: env setup, scripts, supabase env vars, trpc fallback, complete DB schema`

### 2.1 Create `.env`

**Justification:** Expo requires `EXPO_PUBLIC_*` variables to be defined. The `.env` file was missing from the repository.

**Action:** Created `/home/runner/work/rork-mulhim-app-clone/.env` with the provided credentials.

**Note:** `.env` is listed in `.gitignore` to prevent credentials from being committed to source control.

### 2.2 Update `package.json` scripts

**Before:**
```json
"start": "bunx rork start -p 28jubrliud6qls9g2obwx --tunnel"
```

**After:**
```json
"start": "expo start",
"android": "expo start --android",
"ios": "expo start --ios",
"web": "expo start --web",
"start:rork": "bunx rork start -p 28jubrliud6qls9g2obwx --tunnel"
```

**Justification:** The original scripts required the proprietary `rork` CLI. Standard Expo scripts allow running the app locally with `npx expo start` or `bun run start`.

### 2.3 Fix `lib/supabase.ts`

**Before:** Credentials hardcoded as string literals.

**After:** Uses `process.env.EXPO_PUBLIC_SUPABASE_URL` and `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`.

**Justification:** 
- Security: Prevents credentials from being leaked to source control
- Maintainability: Easy to swap environments (dev/staging/prod)
- Best practice: All Expo documentation recommends using env vars

### 2.4 Fix `lib/trpc.ts`

**Before:**
```typescript
if (!url) {
  throw new Error("Rork did not set EXPO_PUBLIC_RORK_API_BASE_URL, please use support");
}
```
This code runs at **module load time**, crashing the entire app on startup if the env var is absent.

**After:** Returns a fallback `http://localhost:3000` if the env var is not set.

**Justification:** The tRPC backend is only used for the example `hi` mutation which is not called anywhere in the app. The app should not crash because of a missing env var for an unused feature.

### 2.5 Complete Supabase Migration SQL

**Before:** The file only created 3 tables (`profiles`, `progress_entries`, `workout_logs`) with generic `JSONB data` columns.

**After:** Full schema matching `remoteFitnessRepo.ts` — 12 tables with:
- Proper typed columns (not JSONB blobs)
- All foreign key relationships
- All indexes
- Row Level Security policies for all tables
- Auto-update trigger for `updated_at`

**New tables added:**
- `user_profiles` (replaces generic `profiles`)
- `exercise_logs`
- `workout_plans`
- `workout_sessions`
- `exercises`
- `nutrition_plans`
- `meal_plans`
- `meals`
- `favorite_exercises`
- `favorite_meals`

---

## Step 3 — Architecture Reorganization

**Date:** 2026-02-22  
**Status:** ✅ Completed  
**Commit:** `refactor: feature-based component architecture with hooks`

### 3.1 New Directory Structure

```
components/
├── ui/                        # Shared primitive components
│   ├── Button.tsx             # Primary/secondary/danger button
│   ├── Card.tsx               # Elevated card container
│   ├── LoadingScreen.tsx      # Full-screen loading indicator
│   └── StatBox.tsx            # Icon + value + label stat widget
├── plan/
│   ├── ExerciseItem.tsx       # Single exercise row with completion + edit
│   └── WeekProgressCard.tsx   # Weekly progress bar
├── nutrition/
│   ├── MacroSummaryCard.tsx   # Calorie + macro display
│   └── MealCard.tsx           # Meal row with completion toggle
├── coach/
│   └── ChatMessage.tsx        # AI chat bubble (user/assistant)
└── profile/
    └── ProfileStats.tsx       # Row of stat boxes

hooks/
├── useProgressStats.ts        # Derived stats from progress + workout logs
├── usePlanGeneration.ts       # Weekly workout plan generation logic
└── useMealPlan.ts             # Meal plan helpers and derived metrics
```

### 3.2 Design Principles Applied

**Feature-based organization** — Components are co-located with the feature they belong to. This makes it easy to find all UI related to "nutrition" in `components/nutrition/`.

**Thin screens** — The screen files (`app/(tabs)/*.tsx`) contain routing and composition logic. Business logic is extracted to hooks. UI is extracted to components.

**Reusable primitives** — `components/ui/` contains generic components that any screen can use without coupling to a specific feature.

**Custom hooks** — Logic that used to live inline in large screen components is now in dedicated hooks:
- `usePlanGeneration` — workout plan AI generation
- `useMealPlan` — meal plan operations + derived metrics
- `useProgressStats` — user progress calculations

---

## Step 4 — Documentation

**Date:** 2026-02-22  
**Status:** ✅ Completed

### Files Created
- `docs/en/README.md` — English overview
- `docs/en/ARCHITECTURE.md` — Technical architecture
- `docs/en/SETUP.md` — Local setup guide
- `docs/en/SCREENS.md` — Screen-by-screen documentation
- `docs/ar/README.md` — Arabic overview
- `docs/ar/ARCHITECTURE.md` — Arabic architecture guide
- `docs/ar/SETUP.md` — Arabic setup guide
- `docs/ar/SCREENS.md` — Arabic screens guide

---

## Verification Checklist

- [x] `.env` created with all required variables
- [x] App can start without `bunx rork` via `npx expo start`
- [x] Supabase credentials loaded from environment variables
- [x] tRPC client does not crash when `EXPO_PUBLIC_RORK_API_BASE_URL` is absent
- [x] Complete Supabase schema matches the actual repository operations
- [x] Components directory created with feature-based structure
- [x] Hooks extracted for reusable logic
- [x] Documentation created in both Arabic and English
