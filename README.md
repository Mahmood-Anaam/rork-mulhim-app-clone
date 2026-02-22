# Mulhim - مُلهم

A comprehensive bilingual (Arabic/English) fitness coaching mobile app built with React Native & Expo.

## Overview

Mulhim (مُلهم - "Inspiring") is a full-featured fitness coaching app that provides AI-generated workout plans, nutrition guidance with Saudi/Middle Eastern cuisine focus, progress tracking, and bilingual RTL support.

## Tech Stack

- **React Native** + **Expo** - Cross-platform mobile development
- **Expo Router** - File-based navigation
- **TypeScript** - Type-safe development
- **Supabase** - Backend (PostgreSQL, Authentication, RLS)
- **React Query** + **tRPC** - Server state management
- **AsyncStorage** - Offline-first local caching
- **Lucide Icons** - UI icon system

## Project Structure

```
├── app/                          # Expo Router screens (file-based routing)
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── _layout.tsx           # Tab layout configuration
│   │   ├── plan.tsx              # Workout plan screen
│   │   ├── nutrition.tsx         # Nutrition planning screen
│   │   ├── coach.tsx             # AI coach screen
│   │   └── profile.tsx           # User profile screen
│   ├── auth/                     # Authentication screens
│   │   ├── login.tsx             # Login screen
│   │   └── signup.tsx            # Sign up screen
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Entry point / router
│   ├── welcome.tsx               # Language selection
│   ├── onboarding.tsx            # Fitness profile setup
│   ├── account-prompt.tsx        # Account creation prompt
│   ├── workout-details.tsx       # Workout detail view
│   ├── meal-details.tsx          # Meal detail view
│   └── bioinformatics.tsx        # Body analysis screen
├── src/                          # Application source code
│   ├── config/                   # Configuration
│   │   ├── env.ts                # Environment variables
│   │   ├── supabase.ts           # Supabase client
│   │   └── index.ts              # Barrel exports
│   ├── services/                 # Data services
│   │   ├── remoteFitnessRepo.ts  # Supabase CRUD operations
│   │   ├── trpc.ts               # tRPC client
│   │   └── index.ts              # Barrel exports
│   ├── providers/                # React Context providers
│   │   ├── AuthProvider.tsx      # Authentication state
│   │   ├── FitnessProvider.tsx   # Fitness data state
│   │   ├── LanguageProvider.tsx  # i18n & RTL state
│   │   └── index.ts              # Barrel exports
│   ├── types/                    # TypeScript definitions
│   │   ├── fitness.ts            # Domain types
│   │   └── index.ts              # Barrel exports
│   ├── constants/                # App constants
│   │   ├── colors.ts             # Color palette
│   │   ├── translations.ts       # AR/EN translations
│   │   └── index.ts              # Barrel exports
│   ├── data/                     # Static data
│   │   ├── exercises.ts          # Exercise database
│   │   └── meals.ts              # Meal suggestions
│   ├── hooks/                    # Custom React hooks
│   └── api/                      # Backend API
│       ├── hono.ts               # Hono server
│       └── trpc/                 # tRPC configuration
├── assets/                       # Static assets (images, icons)
├── docs/                         # Documentation
│   ├── ar/                       # Arabic documentation
│   └── en/                       # English documentation
└── supabase-migration.sql        # Database schema
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or Bun package manager
- Expo CLI

### Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd mulhim-app

# Install dependencies
npm install --legacy-peer-deps
# or
bun install

# Copy environment variables
cp .env.example .env
# Edit .env with your actual values

# Start the development server
npm start
# or
bun run start
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_RORK_DB_ENDPOINT` | Rork DB API endpoint |
| `EXPO_PUBLIC_RORK_DB_NAMESPACE` | Rork DB namespace |
| `EXPO_PUBLIC_RORK_DB_TOKEN` | Rork DB access token |

## Documentation

- [English Documentation](docs/en/README.md)
- [التوثيق بالعربية](docs/ar/README.md)

## Features

- 🏋️ AI-generated workout plans
- 🥗 Nutrition planning with Saudi/Middle Eastern meals
- 📊 Progress tracking & body analytics
- 🤖 AI fitness coach
- 🌐 Bilingual support (Arabic/English with RTL)
- 🔐 Supabase authentication
- 📱 Offline-first with local caching
- 📋 Favorites management (exercises & meals)

## License

This project is private.
