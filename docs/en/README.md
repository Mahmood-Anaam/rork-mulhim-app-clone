# Mulhim App Documentation

Welcome to the documentation for **Mulhim**, a native cross-platform fitness and nutrition application built with React Native, Expo, Supabase, and Rork AI.

## Architecture

The application follows a modular and feature-based architecture organized under the `src/` directory:

- `src/api`: API clients for Supabase and tRPC.
- `src/components`: Reusable UI components.
  - `common/`: Base UI elements.
  - `plan/`: Components specifically for the workout plan screen.
  - `coach/`: Components for the AI Coach interaction.
- `src/constants`: Theme definitions, colors, and global constants.
- `src/context`: React Context Providers for global state (Auth, Fitness, Language).
- `src/hooks`: Custom React hooks for shared logic.
- `src/services`: Business logic and external service wrappers.
- `src/types`: TypeScript type definitions.
- `src/utils`: Helper functions and utilities.
- `src/data`: Static datasets (exercise database, templates).
- `src/backend`: Local Hono backend for tRPC.

## Key Technologies

- **Frontend**: React Native with Expo Router.
- **State Management**: React Context API & Zustand (if used).
- **Backend/API**: Hono with tRPC.
- **Database**: Supabase (via `@supabase/supabase-js`).
- **AI Integration**: Rork AI SDK for AI Coach and intelligent suggestions.

## Installation and Running

1. **Clone the repository**.
2. **Install dependencies**:
   ```bash
   bun install
   ```
3. **Set up environment variables**:
   Create a `.env` file in the root with:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_RORK_DB_ENDPOINT=https://api.rivet.dev
   EXPO_PUBLIC_RORK_DB_NAMESPACE=your_namespace
   EXPO_PUBLIC_RORK_DB_TOKEN=your_token
   ```
4. **Start the app**:
   ```bash
   npm run start
   ```

## Application Flow

1. **Onboarding**: User enters their physical details, goals, and training preferences.
2. **Workout Plan**: AI generates a personalized weekly workout plan based on the user's level and available equipment.
3. **AI Coach**: A chatbot interface where users can ask for meal suggestions, workout tips, or progress analysis.
4. **Nutrition**: Personalized meal plans and macro tracking.
5. **Profile**: Management of personal information and fitness metrics.

## Deep Dive: AI Coach (Rork AI Integration)

The AI Coach is powered by the **Rork AI SDK**, providing a conversational interface that can perform actions within the app through "Tools".

### Technical Implementation
- **SDK**: `@rork-ai/toolkit-sdk`
- **Hook**: `useRorkAgent`
- **Capabilities**:
  - **Context-Aware**: The agent has access to the user's fitness profile and goals.
  - **Tool Use**: The agent can invoke specific functions (Tools) to interact with the app's state.

### Defined Tools
1. **`suggestWorkout`**:
   - **Purpose**: Recommends exercises or modifies the current plan.
   - **Output**: Returns structured exercise data (sets, reps, rest) which can be saved to the user's plan.
2. **`suggestMeal`**:
   - **Purpose**: Suggests healthy meals (focusing on Saudi traditional cuisine).
   - **Output**: Returns nutritional information (calories, protein, ingredients).
3. **`trackProgress`**:
   - **Purpose**: Analyzes trends in the user's weight or strength metrics.
4. **`adjustPlan`**:
   - **Purpose**: Modifies the overall fitness strategy based on user feedback or results.

### Prompt Strategy
The AI is instructed to act as a professional fitness coach with a friendly tone, specializing in the Saudi context (traditional meals, local gym culture).

## Deep Dive: Nutrition Management

Mulhim features a comprehensive nutrition engine that creates and manages personalized meal plans.

### Meal Plan Generation Algorithm
1. **Caloric Calculation**:
   - Uses the **Mifflin-St Jeor Equation** to calculate Basal Metabolic Rate (BMR).
   - Multiplies BMR by an Activity Factor (TDEE).
   - Adjusts TDEE based on the goal (e.g., -500 calories for fat loss).
2. **Macro Distribution**:
   - **Protein**: Calculated per kg of body weight (1.6g - 2.2g depending on goal).
   - **Carbs & Fats**: Balanced based on the selected diet pattern (Balanced, High Protein, Low Carb).
3. **Meal Selection**:
   - Pulls from `src/data/meals.ts` (Saudi-centric dataset).
   - Filters based on the **Food Frequency Questionnaire (FFQ)** from the assessment.
   - Scales meal quantities (calories/macros) proportionally to meet the user's daily target.

### Grocery List Logic
The app automatically extracts all ingredients from the active weekly meal plan, groups them by category (Protein, Carbs, Vegetables, etc.), and generates a checkable shopping list. It handles duplicate ingredients by merging them into a single entry with "As needed" quantity.

## Screenshot Gallery

| Welcome | Onboarding | Workout Plan |
| :---: | :---: | :---: |
| ![Welcome](../screenshots/welcome.png) | ![Onboarding](../screenshots/onboarding.png) | ![Plan](../screenshots/plan.png) |

| AI Coach | Nutrition | Profile |
| :---: | :---: | :---: |
| ![Coach](../screenshots/coach.png) | ![Nutrition](../screenshots/nutrition.png) | ![Profile](../screenshots/profile.png) |

## Screen Descriptions & Interactions

### 1. Welcome & Onboarding
- **Description**: The entry point where users select their language and define their fitness profile.
- **Interactions**: Users select gender, age, weight, height, goal (Fat Loss, Muscle Gain, General Fitness), and activity level.
- **Data Flow**: Data is saved locally via `FitnessProvider` and synced to Supabase `user_profiles` table upon account creation.

### 2. Workout Plan Screen
- **Description**: Displays the AI-generated weekly workout schedule.
- **Interactions**:
  - Expand/Collapse sessions to see exercises.
  - Mark exercises or entire sessions as complete.
  - Edit exercise parameters (sets, reps, rest, weight).
  - Add exercises from a database or favorites.
  - Regenerate sessions.
- **Data Flow**: Updates are synced to `workout_plans`, `workout_sessions`, and `exercises` tables in Supabase.

### 3. AI Coach Screen
- **Description**: A conversational AI interface powered by Rork AI.
- **Interactions**:
  - Ask for workout or meal suggestions.
  - Analyze current progress.
  - Save AI suggestions directly to the workout plan or meal plan.
- **Data Flow**: Uses tRPC to communicate with the AI backend.

### 4. Nutrition Screen
- **Description**: Personalized meal planning and macro tracking.
- **Interactions**:
  - View daily meal suggestions (Breakfast, Lunch, Dinner, Snacks).
  - Track calorie and macro intake.
  - Add favorite meals.
- **Data Flow**: Data is stored in `nutrition_plans`, `meal_plans`, and `meals` tables.

### 5. Profile & Progress
- **Description**: Manage account settings and track physical progress.
- **Interactions**:
  - Update physical metrics.
  - View weight history charts.
  - Change application settings.
- **Data Flow**: Interacts with `user_profiles` and `progress_entries`.
