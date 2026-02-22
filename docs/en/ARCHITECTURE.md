# Architecture Documentation - Mulhim App

## Overview
Mulhim is a fitness and nutrition application built with React Native and Expo. It follows a **Feature-Driven Clean Architecture**, ensuring a strict separation between UI, Business Logic, and Data Access.

## Directory Structure
The project is organized within the `src/` directory to maintain a clean root level:

- `src/api`: Low-level clients for external services (Supabase, tRPC).
- `src/components`: Reusable, stateless UI components (Button, Input, Card).
- `src/context`: Global state management using React Context (Auth, Language, Fitness).
- `src/hooks`: Custom hooks encapsulating domain-specific logic and data orchestration.
- `src/services`: Business logic services, including repository patterns and OpenAI integration.
- `src/screens`: Main application views, decoupled from routing logic.
- `src/types`: TypeScript interfaces and type definitions.
- `src/utils`: Helper functions, constants, and global configuration.

## Data Lifecycle
1. **Data Source**: Supabase (Remote PostgreSQL) and AsyncStorage (Local Cache).
2. **Service Layer**: `remoteFitnessRepo.ts` handles all CRUD operations with Supabase.
3. **Business Logic**: Domain hooks (e.g., `useWorkoutPlan`) manage state transitions and sync with services.
4. **UI Layer**: Screens and components consume data through hooks, remaining agnostic of the data source.

## AI Coach Integration
The AI Coach has been migrated from Rork AI to a custom implementation using **OpenAI GPT-4o**.
- **Service**: `openAIService.ts` handles direct communication with OpenAI API.
- **Hook**: `useAICoach.ts` manages chat history and detects structured recommendations (workouts/meals) from AI responses.

## UI Components Breakdown

### Welcome Screen
- **Components**: `View`, `Text`, `TouchableOpacity`, `Globe` icon.
- **Hook**: `useLanguage` for setting app-wide language.

### Dashboard (Plan)
- **Components**: `Card`, `ProgressBar`, `CheckCircle`, `Dumbbell` icon.
- **Hook**: `useWorkoutPlan` for managing sessions and exercise completion.

### AI Coach
- **Components**: `KeyboardAvoidingView`, `ScrollView`, `Bot` icon, `Send` icon.
- **Hook**: `useAICoach` for real-time interaction with the OpenAI-powered coach.
