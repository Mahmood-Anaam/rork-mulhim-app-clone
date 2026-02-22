# App Operations Guide

## Complete User Journey

### Phase 1: First Launch

#### Language Selection
When the app opens for the first time, the user is presented with the **Welcome Screen** where they can choose between:
- **العربية** (Arabic) - Activates RTL layout
- **English** - Standard LTR layout

The selected language is persisted in AsyncStorage and used throughout the app.

#### Account Decision
After selecting a language, the user sees the **Account Prompt** screen with three options:
1. **Create Account** → Goes to Sign Up
2. **Sign In** → Goes to Login
3. **Continue as Guest** → Goes directly to Onboarding

### Phase 2: Authentication (Optional)

#### Sign Up
- User enters email and password
- Supabase creates the account
- Email verification may be required (depends on Supabase config)
- On success, user is redirected to Onboarding

#### Login
- User enters email and password
- Supabase authenticates credentials
- On success, if profile exists → redirected to Plan tab
- If no profile → redirected to Onboarding

#### Password Reset
- User can request a password reset email
- Supabase sends a reset link to the registered email

### Phase 3: Onboarding (Fitness Profile)

The onboarding process collects comprehensive fitness data through a multi-step form:

1. **Personal Info**: Age, weight (kg), height (cm), gender, target weight
2. **Fitness Goal**: Fat loss, muscle gain, or general fitness
3. **Fitness Level**: Beginner, intermediate, or advanced
4. **Training Setup**: Gym, home, or minimal equipment
5. **Activity Level**: None, light, moderate, or high
6. **Schedule**: Available training days per week
7. **Session Duration**: Preferred workout duration (30-90 min)
8. **Injuries**: Any existing injuries or limitations

Data is saved to AsyncStorage immediately and synced to Supabase if the user is authenticated.

### Phase 4: Main App

#### Workout Plan (Plan Tab)

**Viewing the Plan:**
- Weekly workout plan displayed with sessions per day
- Each session shows: day name, session name, duration, number of exercises
- Color-coded completion status

**Workout Session Details:**
- List of exercises with sets, reps, rest periods
- Recommended weights based on gender and fitness level
- Video links for exercise demonstrations
- Equipment needed

**Completing a Session:**
1. Navigate to a workout session
2. Mark individual exercises as completed (checkbox)
3. When all exercises are done, mark session as complete
4. Completion is synced to Supabase (updates `workout_sessions` table)
5. A workout log is created (stored in `workout_logs`)

**Generating a New Plan:**
- Triggered from the Plan tab when no active plan exists
- AI generates a plan based on user's fitness profile
- Plan includes exercises from the exercise database
- Saved to Supabase with sessions and exercises

#### Nutrition Planning (Nutrition Tab)

**Nutrition Assessment:**
1. User answers questions about:
   - Meal structure (1 meal + snacks, 2 meals, 3 meals, 3 meals + snacks)
   - Diet history
   - Food frequency questionnaire
   - Favorite meals
2. Assessment saved locally

**Nutrition Plan Generation:**
- AI generates a plan with:
  - Target daily calories
  - Macro distribution (protein, carbs, fats)
  - Diet pattern (balanced, high protein, etc.)
  - Meal distribution (meals per day, protein per meal)
  - Recommendations

**Daily Meal Plans:**
- Breakfast, lunch, dinner, and snacks
- Each meal shows: name (Arabic/English), calories, macros
- Meals sourced from Saudi/Middle Eastern meal database
- Meal completion tracking

**Grocery List:**
- Auto-generated based on meal plan
- Lists ingredients needed for the week
- Items can be checked off

#### AI Coach (Coach Tab)

- Personalized fitness advice based on profile
- Workout modification suggestions
- Nutrition tips
- Progress analysis and recommendations

#### Profile Management (Profile Tab)

**View Profile:**
- Display all fitness profile data
- Edit profile information
- Update fitness goals

**Progress Tracking:**
- Add weight entries with optional notes
- View weight history
- Data synced to Supabase `progress_entries` table

**Favorites:**
- Save favorite exercises for quick access
- Save favorite meals for quick reference
- Synced to Supabase `favorite_exercises` and `favorite_meals` tables

**Bioinformatics:**
- Body composition analysis
- BMI calculation
- Body metrics visualization

**Account Management:**
- Sign out (clears session, keeps local data)
- View account information

---

## Data Synchronization

### Online Mode (Authenticated User)
```
User Action → AsyncStorage (immediate) → Supabase (background sync)
```

### Offline Mode (Guest or No Connection)
```
User Action → AsyncStorage (all data stored locally)
```

### Sync on Login
When a user logs in, the app:
1. Fetches profile from Supabase
2. Fetches workout plans, logs, progress entries
3. Fetches favorites
4. Merges with local data
5. Updates UI

### Conflict Resolution
- Remote data takes priority for profile and plans
- Local-only data (not yet synced) is preserved
- Network errors trigger automatic retry with exponential backoff

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Network error during save | Data saved locally, retry on next opportunity |
| Supabase auth token expired | Auto-refresh via Supabase client |
| Invalid data from server | Graceful fallback to local cache |
| Missing required fields | Form validation prevents submission |
| Duplicate account signup | Error message with sign-in suggestion |

---

## Performance Considerations

- **AsyncStorage**: All data cached for instant access
- **Batch Operations**: Exercises inserted in batches of 50
- **Lazy Loading**: Data fetched on-demand per screen
- **Optimistic Updates**: UI updated before server confirmation
- **Memory Management**: Large lists use efficient rendering
