# Mulhim (ملهم) — AI Fitness App

> A fully-featured, bilingual (Arabic/English) fitness companion built with React Native, Expo, Supabase, and OpenAI.

## Overview

**Mulhim** means *Inspiring* in Arabic. It is an AI-powered mobile fitness application targeting Arabic-speaking users, offering:

- 🏋️ **Personalized workout plans** generated based on user profile, fitness level, available equipment, and goals
- 🥗 **Saudi-cuisine-based nutrition plans** tailored to the user's dietary history
- 🤖 **AI Coach** — a conversational assistant powered by OpenAI that can suggest workouts, meals, and track progress
- 📊 **Progress tracking** with weight logging and streak counting
- 🌐 **Bilingual support** — full Arabic (RTL) and English interface

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo (SDK 54) |
| Routing | Expo Router v6 (file-based) |
| Backend (Auth + DB) | Supabase (PostgreSQL + Row Level Security) |
| AI | OpenAI via `@rork-ai/toolkit-sdk` |
| State Management | React Context + Zustand + React Query |
| API Layer | tRPC + Hono |
| Storage | AsyncStorage (offline cache) |
| Language | TypeScript |

## Quick Start

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd rork-mulhim-app-clone

# 2. Install dependencies
bun install          # or: npm install

# 3. Create environment file
cp .env.example .env   # then fill in your keys

# 4. Start the app
bun run start          # Expo DevTools in browser
bun run web            # Web preview in browser
bun run ios            # iOS Simulator (macOS only)
bun run android        # Android Emulator
```

## Key Features

### Workout Planning
- AI-selects workout templates (Full Body / Upper-Lower / Push-Pull-Legs) based on your profile
- Filters exercises by location (gym / home / minimal equipment) and injuries
- Adjusts sets/reps/rest based on goal (fat loss / muscle gain / fitness)
- Exercise completion tracking with streak counting

### Nutrition
- Food frequency questionnaire (FFQ) to assess eating habits
- Auto-generated weekly meal plan using traditional Saudi dishes
- Grocery list generation from meal plan
- AI-generated custom meal suggestions (via OpenAI)

### AI Coach
- Real-time chat with streaming responses
- Context-aware suggestions using user's profile and current plan
- Save suggested workouts/meals directly to your plan

### Authentication
- Email/password sign-up and sign-in via Supabase Auth
- Guest mode (offline with local storage)
- Automatic cloud sync when user signs in

## Project Structure

```
├── app/                  # Expo Router screens
│   ├── (tabs)/           # Main tab screens
│   ├── auth/             # Login & signup
│   └── ...               # Other screens
├── components/           # Reusable UI components
│   ├── ui/               # Shared primitives (Button, Card, etc.)
│   ├── plan/             # Workout plan components
│   ├── nutrition/        # Nutrition components
│   ├── coach/            # AI coach components
│   └── profile/          # Profile components
├── hooks/                # Custom React hooks
├── providers/            # Context providers (Auth, Fitness, Language)
├── lib/                  # External service clients
│   ├── supabase.ts       # Supabase client
│   ├── trpc.ts           # tRPC client
│   └── remoteFitnessRepo.ts  # Supabase data access layer
├── types/                # TypeScript type definitions
├── constants/            # Colors, translations
├── data/                 # Static data (exercises, meals)
├── backend/              # Hono/tRPC API server
├── docs/                 # Documentation (this folder)
└── supabase-migration.sql  # Database schema
```

## Documentation Index

- [Setup Guide](SETUP.md) — Installation and environment configuration
- [Architecture](ARCHITECTURE.md) — Code design and data flow
- [Screens](SCREENS.md) — Screen-by-screen documentation

---

*Built with ❤️ using [Rork.com](https://rork.com)*
