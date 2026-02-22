# Architecture — Mulhim App

## Folder Structure

```
rork-mulhim-app-clone/
├── app/                        # Expo Router screens (UI only)
│   ├── _layout.tsx             # Root layout: providers, navigation stack
│   ├── (tabs)/                 # Bottom-tab screens
│   │   ├── plan.tsx            # Workout plan screen
│   │   ├── nutrition.tsx       # Nutrition & meal plan screen
│   │   ├── coach.tsx           # AI Coach chat screen
│   │   └── profile.tsx         # User profile screen
│   ├── auth/                   # Authentication screens
│   ├── onboarding.tsx
│   ├── workout-details.tsx
│   └── meal-details.tsx
│
├── src/                        # Business logic & services
│   ├── utils/
│   │   └── config.ts           # Central env-var configuration
│   ├── services/
│   │   └── openai.ts           # generateObject + chatWithTools
│   └── hooks/
│       └── useOpenAICoach.ts   # Stateful AI coach hook
│
├── lib/
│   ├── supabase.ts             # Supabase client singleton
│   └── remoteFitnessRepo.ts   # Supabase CRUD operations
│
├── providers/
│   ├── AuthProvider.tsx        # Supabase auth state
│   ├── FitnessProvider.tsx     # App-wide fitness data
│   └── LanguageProvider.tsx    # i18n context
│
├── constants/
│   ├── colors.ts
│   └── translations.ts
│
├── data/                       # Static seed data
│   ├── exercises.ts
│   └── meals.ts
│
├── types/
│   └── fitness.ts              # TypeScript interfaces
│
└── docs/                       # Engineering documentation
```

---

## Data Lifecycle

### Authentication Flow

```
App start
  → AuthProvider.useEffect
      → supabase.auth.getSession()
          → user != null  → navigate to (tabs)
          → user == null  → navigate to /welcome
```

### AI Coach Flow

```
User sends message
  → useOpenAICoach.sendMessage(text)
      → chatWithTools(messages, tools)
          → POST https://api.openai.com/v1/chat/completions
              → tool_calls in response?
                  yes → tools[name].execute(input)  → update React state
                  no  → text response
      → setMessages([...prev, assistantMsg])
```

### Structured Meal Generation (Nutrition Screen)

```
User enters custom meal name
  → generateObject({ messages, schema: mealSchema })
      → POST https://api.openai.com/v1/chat/completions
         (response_format: json_object)
      → schema.parse(JSON.parse(content))
      → MealSuggestion object returned
```

### Fitness Data Flow

```
FitnessProvider.loadData()
  ├── AsyncStorage  (local cache, hydrated first)
  └── remoteFitnessRepo  (Supabase, synced on auth)
       ← supabase client  ← config.ts (EXPO_PUBLIC_SUPABASE_*)
```

---

## Screen → Hook / Service Map

| Screen | Custom Hook / Service |
|---|---|
| `app/(tabs)/coach.tsx` | `useOpenAICoach`, `useFitness`, `useLanguage` |
| `app/(tabs)/nutrition.tsx` | `generateObject` (openai.ts), `useFitness` |
| `app/(tabs)/plan.tsx` | `useFitness`, `useLanguage` |
| `app/(tabs)/profile.tsx` | `useAuth`, `useFitness` |
| `app/auth/login.tsx` | `useAuth` |
| `app/auth/signup.tsx` | `useAuth` |
| `app/onboarding.tsx` | `useFitness` |
