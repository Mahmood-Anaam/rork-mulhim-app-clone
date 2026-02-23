# Architectural Planning: Mulhim App Refactoring

## 1. Current State Analysis
- **Framework**: Expo Router + React Native.
- **Dependency Management**: Hijacked by Rork AI (`bunx rork start`).
- **Coupling**: UI components contain heavy business logic, API calls, and complex state management (e.g., `FitnessProvider.tsx`, `CoachScreen.tsx`).
- **Data Flow**: Direct calls to `remoteFitnessRepo.ts` from within providers/screens.
- **Vendor Lock-in**: Uses `@rork-ai/toolkit-sdk` for AI Coach features.
- **Code Quality**: Lack of proper directory structure, large files (500+ lines), and minimal documentation.

## 2. Target Architecture (Feature-Driven Clean Architecture)
We are migrating to a modular, decoupled structure within a `src/` directory to ensure maintainability, scalability, and testability.

### 2.1 Directory Structure
- `src/api`: Low-level API clients (Supabase, tRPC).
- `src/components`: Reusable, stateless UI components (Buttons, Cards, Inputs).
- `src/context`: React Context providers for global state (Auth, Language).
- `src/hooks`: Custom hooks encapsulating business logic and data orchestration.
- `src/services`: Business logic services and repository patterns (Data fetching, OpenAI integration).
- `src/types`: TypeScript interfaces and type definitions.
- `src/utils`: Helper functions, constants, and global configuration.
- `src/screens`: Main application views, decoupled from routing logic.

### 2.2 State Management Strategy
- **Global State**: React Context for Auth and Language.
- **Domain State**: Custom hooks (e.g., `useWorkoutPlan`, `useNutrition`) managing local state and syncing with Supabase.
- **Server State**: React Query (via `@tanstack/react-query`) for efficient data fetching and caching.

## 3. Decoupling Plan

### 3.1 Logic Extraction
1. **Repository Pattern**: Refine `remoteFitnessRepo.ts` as a clean service layer for Supabase.
2. **Custom Hooks**: Move logic from `FitnessProvider.tsx` into domain-specific hooks:
   - `useWorkoutPlan`: Manages exercises, sessions, and workout completion.
   - `useNutrition`: Manages meal plans, assessments, and macros.
   - `useProgress`: Manages weight tracking and streaks.
3. **AI Migration**: Replace Rork SDK with a custom `OpenAIService` and `useAICoach` hook.

### 3.2 UI Refactoring
1. **Screen Components**: Move JSX from `app/*.tsx` to `src/screens/*.tsx`.
2. **Stateless Components**: Extract repeated UI elements into `src/components/`.
3. **Themes**: Standardize colors and typography in `src/constants/`.

## 4. Migration Steps
- [ ] Cleanup Rork-specific scripts and dependencies.
- [ ] Setup `src/` hierarchy and move existing files.
- [ ] Refactor providers into hooks.
- [ ] Implement OpenAI-based Coach.
- [ ] Standardize error handling and loading states.
- [ ] Comprehensive bilingual documentation.
