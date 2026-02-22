# Mulhim App - Documentation

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [App Screens & User Flow](#app-screens--user-flow)
- [Data Flow & Supabase Integration](#data-flow--supabase-integration)
- [Authentication](#authentication)
- [State Management](#state-management)
- [Database Schema](#database-schema)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

Mulhim (مُلهم - "Inspiring") is a bilingual (Arabic/English) fitness coaching mobile application built with React Native and Expo. It provides:

- **AI-generated workout plans** tailored to user fitness profiles
- **Nutrition planning** focused on Saudi/Middle Eastern cuisine
- **Progress tracking** with weight logs and workout completion
- **AI coaching** for personalized fitness advice
- **Full RTL support** for Arabic interface
- **Offline-first architecture** with local caching via AsyncStorage

---

## Architecture

### Technology Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React Native 0.81 + Expo 54 |
| **Navigation** | Expo Router (file-based) |
| **Language** | TypeScript (strict mode) |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **Server State** | React Query + tRPC |
| **Local State** | React Context + AsyncStorage |
| **Icons** | Lucide React Native |
| **Build** | Metro Bundler + Babel |

### Directory Structure

```
mulhim-app/
├── app/                    # Screens & navigation (Expo Router)
│   ├── (tabs)/             # Main tab screens
│   ├── auth/               # Auth screens (login, signup)
│   ├── _layout.tsx         # Root layout with providers
│   └── index.tsx           # Entry point / routing logic
├── src/                    # Application source code
│   ├── config/             # Configuration (env vars, Supabase client)
│   ├── services/           # Data access layer (Supabase CRUD)
│   ├── providers/          # React Context providers (Auth, Fitness, Language)
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # Colors, translations
│   ├── data/               # Static exercise & meal databases
│   ├── hooks/              # Custom React hooks
│   └── api/                # Backend API (Hono + tRPC)
├── assets/                 # Images, icons
├── docs/                   # Documentation
└── supabase-migration.sql  # Database schema & RLS policies
```

### Design Patterns

1. **Offline-First**: All data is cached in AsyncStorage and synced with Supabase when online
2. **Repository Pattern**: `remoteFitnessRepo.ts` abstracts all Supabase operations
3. **Provider Pattern**: React Context providers manage Auth, Fitness data, and Language state
4. **Barrel Exports**: Each module has an `index.ts` for clean imports
5. **Environment Configuration**: All secrets managed via `.env` files

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **Bun** package manager
- **Expo Go** app on your mobile device (for testing)
- A **Supabase** project (for backend services)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/rork-mulhim-app-clone.git
cd rork-mulhim-app-clone

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your actual Supabase and Rork DB credentials

# 4. Set up the database
# Run the SQL in supabase-migration.sql in your Supabase SQL editor

# 5. Start the development server
npm start
```

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `EXPO_PUBLIC_RORK_DB_ENDPOINT` | Rork DB API endpoint | Yes |
| `EXPO_PUBLIC_RORK_DB_NAMESPACE` | Rork DB namespace identifier | Yes |
| `EXPO_PUBLIC_RORK_DB_TOKEN` | Rork DB access token | Yes |

### Running on Device

1. Install **Expo Go** from the App Store (iOS) or Google Play (Android)
2. Run `npm start` in the project directory
3. Scan the QR code displayed in the terminal
4. The app will load on your device

### Running on Web

```bash
npm run start-web
```

---

## App Screens & User Flow

> 📸 **Screenshots**: See [docs/screenshots/](../screenshots/README.md) for screenshots of all app screens.

### 1. Welcome Screen (`welcome.tsx`)
- **Purpose**: Language selection (Arabic / English)
- **Actions**: User selects their preferred language
- **Navigation**: Proceeds to Account Prompt or Onboarding

### 2. Account Prompt (`account-prompt.tsx`)
- **Purpose**: Prompt user to create an account or continue as guest
- **Actions**: Sign up, Sign in, or Continue as guest
- **Navigation**: Auth screens or Onboarding

### 3. Authentication (`auth/login.tsx`, `auth/signup.tsx`)
- **Purpose**: User authentication via Supabase
- **Login**: Email + password authentication
- **Signup**: Create new account with email verification
- **Features**: Password reset, error handling

### 4. Onboarding (`onboarding.tsx`)
- **Purpose**: Collect fitness profile data
- **Data collected**:
  - Age, weight, height, gender
  - Fitness goal (fat loss, muscle gain, general fitness)
  - Fitness level (beginner, intermediate, advanced)
  - Training location (gym, home, minimal equipment)
  - Activity level
  - Available training days
  - Session duration preference
  - Existing injuries
- **Navigation**: Saves profile and goes to Plan tab

### 5. Plan Tab (`(tabs)/plan.tsx`)
- **Purpose**: Display and manage weekly workout plans
- **Features**:
  - AI-generated workout plan based on user profile
  - View workout sessions by day
  - Track session completion
  - View exercise details (sets, reps, rest, video)
  - Mark exercises as completed
- **Data Flow**: Reads from `FitnessProvider` → Syncs with Supabase

### 6. Nutrition Tab (`(tabs)/nutrition.tsx`)
- **Purpose**: Nutrition planning and meal management
- **Features**:
  - Nutrition assessment questionnaire
  - AI-generated daily/weekly meal plans
  - Saudi/Middle Eastern meal suggestions
  - Macro tracking (calories, protein, carbs, fats)
  - Grocery list generation
- **Data Flow**: Nutrition plans stored locally and synced to Supabase

### 7. Coach Tab (`(tabs)/coach.tsx`)
- **Purpose**: AI fitness coaching
- **Features**:
  - Personalized fitness advice
  - Workout recommendations
  - Nutrition guidance
  - Progress analysis

### 8. Profile Tab (`(tabs)/profile.tsx`)
- **Purpose**: User profile management
- **Features**:
  - View/edit fitness profile
  - Progress tracking (weight graph)
  - Add weight entries
  - View workout history
  - Manage favorite exercises and meals
  - Bioinformatics analysis
  - Account management (sign out)

### 9. Workout Details (`workout-details.tsx`)
- **Purpose**: Detailed view of a workout session
- **Features**: Exercise list, video links, weight recommendations

### 10. Meal Details (`meal-details.tsx`)
- **Purpose**: Detailed view of a meal
- **Features**: Ingredients, macros, preparation info

### 11. Bioinformatics (`bioinformatics.tsx`)
- **Purpose**: Body composition analysis
- **Features**: BMI calculation, body metrics

### User Flow Diagram

```
Welcome (Language Selection)
    │
    ▼
Account Prompt ──────────► Auth (Login/Signup)
    │                           │
    │ (Guest)                   │ (Authenticated)
    ▼                           ▼
Onboarding (Fitness Profile)
    │
    ▼
Main App (Tabs)
    ├── Plan Tab ──► Workout Details
    ├── Nutrition Tab ──► Meal Details
    ├── Coach Tab
    └── Profile Tab ──► Bioinformatics
```

---

## Data Flow & Supabase Integration

### Architecture Overview

```
App UI (React Components)
    │
    ▼
Providers (AuthProvider, FitnessProvider, LanguageProvider)
    │
    ├── Local Cache (AsyncStorage) ← Immediate reads/writes
    │
    └── Remote Sync (Supabase via remoteFitnessRepo) ← Background sync
```

### Data Operations

#### Profile Management
1. User fills onboarding form → `FitnessProvider.saveProfile()`
2. Profile saved to AsyncStorage (immediate)
3. If authenticated, profile synced to Supabase via `remoteFitnessRepo.upsertProfile()`
4. On app load, profile hydrated from AsyncStorage first, then refreshed from Supabase

#### Workout Plans
1. AI generates weekly plan → `FitnessProvider.setWeekPlan()`
2. Plan saved to AsyncStorage
3. If authenticated, plan saved to Supabase via `remoteFitnessRepo.saveWorkoutPlan()`
4. Session completion tracked via `remoteFitnessRepo.updateSessionCompletion()`
5. Workout logs recorded via `remoteFitnessRepo.insertWorkoutLog()`

#### Nutrition Plans
1. Nutrition assessment collected → stored locally
2. AI generates meal plan → `FitnessProvider.setNutritionPlan()`
3. Plan saved to AsyncStorage and synced to Supabase
4. Meal completion tracked locally

#### Progress Tracking
1. User adds weight entry → `FitnessProvider.addProgressEntry()`
2. Entry saved to AsyncStorage
3. If authenticated, synced to Supabase via `remoteFitnessRepo.insertProgressEntry()`
4. Historical data fetched from Supabase on login

#### Favorites
1. User favorites exercise/meal → `FitnessProvider.addFavoriteExercise/Meal()`
2. Saved to AsyncStorage immediately
3. If authenticated, synced to Supabase via `remoteFitnessRepo.addFavoriteExercise/Meal()`

### Error Handling

The `remoteFitnessRepo` service implements:
- **Retry logic**: Automatic retry with exponential backoff for network errors
- **Network error detection**: Identifies fetch failures and wraps them as `NETWORK_ERROR`
- **Graceful degradation**: App continues working offline using cached data
- **Batch operations**: Large data sets (exercises) are inserted in batches of 50

---

## Authentication

### Flow

1. **Supabase Auth** handles email/password authentication
2. `AuthProvider` manages session state with auto-refresh
3. Session persisted in AsyncStorage for app restarts
4. User state available app-wide via `useAuth()` hook

### Features

- Email/password sign up with duplicate detection
- Email/password sign in
- Password reset via email
- Automatic session refresh
- Platform-aware session detection (web URL detection)

---

## State Management

### Providers

| Provider | Purpose | Key State |
|---|---|---|
| `AuthProvider` | Authentication state | `user`, `session`, `isLoading` |
| `FitnessProvider` | All fitness data | `profile`, `progress`, `workoutLogs`, `currentWeekPlan`, `nutritionPlan`, `favorites` |
| `LanguageProvider` | Internationalization | `language`, `isRTL`, `t` (translations) |

### Data Loading Sequence

1. App starts → `LanguageProvider` loads saved language from AsyncStorage
2. `AuthProvider` checks for existing Supabase session
3. `FitnessProvider` boot sequence:
   a. Hydrate all data from AsyncStorage (fast, offline)
   b. If user authenticated, fetch latest data from Supabase
   c. Merge remote data with local cache
   d. Update UI with final state

---

## Database Schema

The Supabase database includes these tables:

### `user_profiles`
- Stores user fitness profiles
- One profile per user (upsert on conflict)
- Fields: age, weight, height, gender, goal, fitness_level, etc.

### `workout_plans`
- Stores generated workout plans
- Status: `active` or `archived`
- Links to `workout_sessions`

### `workout_sessions`
- Individual workout days within a plan
- Tracks completion status
- Links to `exercises`

### `exercises`
- Individual exercises within sessions
- Stores sets, reps, rest, weights, descriptions

### `workout_logs`
- Completed workout records
- Links to `exercise_logs`

### `exercise_logs`
- Individual exercise completion records

### `progress_entries`
- Weight tracking entries
- Timestamped measurements

### `nutrition_plans`
- Generated nutrition plans
- Macro targets and diet patterns

### `meal_plans`
- Daily meal breakdowns
- Links to `meals`

### `meals`
- Individual meal details
- Bilingual names and ingredients

### `favorite_exercises` / `favorite_meals`
- User's saved favorites

### Row Level Security (RLS)

All tables have RLS policies ensuring:
- Users can only **read** their own data
- Users can only **insert** their own data
- Users can only **update** their own data
- Users can only **delete** their own data

---

## Environment Configuration

### `.env.example`

```env
# Rork DB Configuration
EXPO_PUBLIC_RORK_DB_ENDPOINT="https://api.rivet.dev"
EXPO_PUBLIC_RORK_DB_NAMESPACE="your-rork-namespace"
EXPO_PUBLIC_RORK_DB_TOKEN="your-rork-db-token"

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### How Environment Variables Work

1. Expo loads `.env` files automatically
2. Variables prefixed with `EXPO_PUBLIC_` are available in client code
3. `src/config/env.ts` centralizes access to all environment variables
4. `src/config/supabase.ts` uses env vars to initialize the Supabase client

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|---|---|
| Dependency peer conflicts | Use `npm install --legacy-peer-deps` |
| Supabase connection fails | Verify `.env` values and network connectivity |
| App shows loading forever | Check Supabase auth session; clear AsyncStorage |
| RTL not working | Ensure language is set; may need app restart for RTL changes |
| TypeScript errors | Run `npx tsc --noEmit` to check; ensure types match Supabase schema |

### Clearing Cache

```bash
# Clear AsyncStorage (in app)
# Navigate to Profile > Settings > Clear Data

# Clear Expo cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules
npm install --legacy-peer-deps
```

### Debugging

- Supabase operations log to console with `[RemoteRepo]` prefix
- FitnessProvider logs boot sequence with `[FitnessProvider]` prefix
- Network errors are caught and wrapped as `NETWORK_ERROR`
