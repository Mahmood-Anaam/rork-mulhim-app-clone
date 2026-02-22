# Screen Documentation — Mulhim App

## App Navigation Flow

```
Launch
  │
  ▼
app/index.tsx (redirect logic)
  │
  ├─► /welcome           — Language selection (first launch)
  │
  ├─► /account-prompt    — Sign in or continue as guest
  │     ├─► /auth/login
  │     └─► /onboarding
  │
  ├─► /onboarding        — 7-step profile setup wizard
  │
  └─► /(tabs)            — Main tab navigation
        ├─ /plan          — Workout plan
        ├─ /nutrition     — Meal plan
        ├─ /coach         — AI assistant
        └─ /profile       — User profile & settings
```

---

## 1. Welcome Screen (`/welcome`)

**File:** `app/welcome.tsx`  
**Shown:** First launch only

### Description
Language selection screen. Supports Arabic (RTL) and English (LTR). The selection is persisted to `AsyncStorage`.

### UI Elements
- App icon (Globe)
- Arabic greeting: "أهلاً"
- English greeting: "Hello"
- Two large language buttons: **العربية** / **English**
- Footer with app name "ملهم"

### Behavior
1. User taps a language button
2. Language saved to `AsyncStorage`
3. RTL layout applied if Arabic selected
4. Redirected to `app/index.tsx` which determines next screen

---

## 2. Account Prompt Screen (`/account-prompt`)

**File:** `app/account-prompt.tsx`  
**Shown:** When no profile exists and no user is logged in

### Description
Asks the user to sign in or continue as a guest. Animated entrance.

### UI Elements
- User icon
- Title and description (bilingual)
- **Sign In** button → `/auth/login`
- **Skip (Continue as Guest)** button → `/onboarding`

---

## 3. Login Screen (`/auth/login`)

**File:** `app/auth/login.tsx`

### Description
Email/password sign-in form.

### UI Elements
- Email input field
- Password input field (secure)
- **Sign In** button with loading state
- Link to sign-up screen

### Behavior
- Calls `AuthProvider.signIn(email, password)`
- On success: redirects to `app/index.tsx`
- On failure: shows `Alert` with error message

---

## 4. Sign Up Screen (`/auth/signup`)

**File:** `app/auth/signup.tsx`

### Description
Account creation form with duplicate-email detection.

### UI Elements
- Email and password inputs
- **Create Account** button
- Link back to login

---

## 5. Onboarding Screen (`/onboarding`)

**File:** `app/onboarding.tsx`

### Description
A 7-step wizard to collect the user's fitness profile.

### Steps

| Step | Data Collected |
|------|---------------|
| 0 | Age |
| 1 | Weight + Height |
| 2 | Gender (Male/Female) |
| 3 | Goal (Fat Loss / Muscle Gain / General Fitness) |
| 4 | Activity Level (None / Light / Moderate / High) |
| 5 | Training Location (Gym / Home / Minimal Equipment) |
| 6 | Available Days + Session Duration + Injuries |

### Behavior
- Progress bar shows current step
- Each step validated before advancing
- On completion: calls `FitnessProvider.saveProfile()` → syncs to Supabase if logged in
- Redirects to `/(tabs)/plan`

---

## 6. Plan Screen (`/(tabs)/plan`)

**File:** `app/(tabs)/plan.tsx`

### Description
The main workout planning screen. Shows the AI-generated weekly workout plan.

### Features
- **Week progress bar** — shows completed vs. total sessions
- **Workout sessions** — expandable cards for each training day
  - Session completion toggle (circle → checkmark)
  - Exercise list with individual completion tracking
  - Edit exercise (sets/reps/rest/weight)
  - Delete exercise from session
  - Add exercise from database
  - Regenerate session with different exercises
- **Favorite exercises** — collapsible section to add saved exercises to any session
- **Calendar view** — week overview with session status

### Components Used
- `components/plan/ExerciseItem` — individual exercise row
- `components/plan/WeekProgressCard` — progress bar

### Hooks Used
- `usePlanGeneration` — generates the initial plan from profile data

### Data Sources
- `data/exercises.ts` — exercise database with ~100 exercises
- `FitnessProvider.currentWeekPlan` — current plan state
- `FitnessProvider.favoriteExercises` — saved favorites

---

## 7. Nutrition Screen (`/(tabs)/nutrition`)

**File:** `app/(tabs)/nutrition.tsx`

### Description
Full nutrition management: assessment, meal plan, and grocery list.

### Features

#### Nutrition Assessment
- Food Frequency Questionnaire (FFQ)
- Meal history entry (breakfast/lunch/dinner/snacks)
- Generates `NutritionPlan` with:
  - Target calories (based on TDEE + goal)
  - Macro targets (protein/carbs/fats)
  - Diet pattern classification

#### Weekly Meal Plan
- Displays 7-day meal plan
- Each day shows: breakfast, lunch, dinner, snacks
- Meal completion toggling
- Add meals: from Saudi food database, from favorites, or custom (AI-generated)
- Remove meals
- Calorie and macro totals per day

#### Grocery List
- Auto-generated from meal plan ingredients
- Items grouped by category (protein, carbs, vegetables, dairy, spices, other)
- Check off purchased items
- Add custom items

### Components Used
- `components/nutrition/MacroSummaryCard` — calorie/macro display
- `components/nutrition/MealCard` — individual meal row

### Hooks Used
- `useMealPlan` — meal plan operations and derived metrics

---

## 8. AI Coach Screen (`/(tabs)/coach`)

**File:** `app/(tabs)/coach.tsx`

### Description
An AI-powered conversational coach using OpenAI streaming responses.

### Features
- **Chat interface** — messages from user and AI displayed as bubbles
- **Quick actions** — pre-set prompts:
  - Today's workout suggestion
  - Nutrition advice
  - Motivation message
  - Progress analysis
- **AI tools** (via `@rork-ai/toolkit-sdk`):
  - `suggestWorkout` — proposes exercises with structured data
  - `suggestMeal` — proposes a Saudi meal with macros
  - `trackProgress` — analyzes user metrics
  - `adjustPlan` — suggests plan modifications
- **Save to plan** — save AI-suggested workouts/meals directly

### Components Used
- `components/coach/ChatMessage` — chat bubble component

### AI System Prompt
The coach receives the user's profile, current plan, and active meal plan as context with every request.

---

## 9. Profile Screen (`/(tabs)/profile`)

**File:** `app/(tabs)/profile.tsx`

### Description
User dashboard with stats, settings, and account management.

### Sections

#### Stats Row
- Current streak (consecutive workout days)
- Total workouts completed
- Current weight
- Weight change since start

#### Body Metrics
- BMR (Basal Metabolic Rate)
- TDEE (Total Daily Energy Expenditure)
- BMI

#### Progress Chart
- Weight history line chart (if progress entries exist)

#### Settings
- Language toggle (Arabic ↔ English)
- Edit profile → re-runs relevant onboarding steps
- Log weight → adds a progress entry
- Sign out

### Components Used
- `components/profile/ProfileStats` — stats row
- `components/ui/StatBox` — individual stat widget

### Hooks Used
- `useProgressStats` — derived stats (BMI, weight change, streak)

---

## 10. Workout Details (`/workout-details`)

**File:** `app/workout-details.tsx`

### Description
Detailed view of a single workout session. Shows exercise instructions, video links, and recommended weights based on user's gender and fitness level.

---

## 11. Meal Details (`/meal-details`)

**File:** `app/meal-details.tsx`

### Description
Detailed view of a meal: full ingredient list (Arabic + English), nutritional breakdown, and cooking tips.
