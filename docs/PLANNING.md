# Mulhim App — Architecture Planning

## 1. Current State (Before Refactor)

| Concern | Reality |
|---|---|
| Build / start scripts | Hijacked by `bunx rork start` — cannot run locally |
| AI layer | `@rork-ai/toolkit-sdk` — vendor-locked, un-auditable |
| Backend | Embedded Hono + tRPC server copied into the repo (`backend/`) |
| Supabase config | Credentials hard-coded directly in `lib/supabase.ts` |
| Metro | Wrapped by `withRorkMetro` from Rork SDK |
| Environment variables | Mixed: some Rork-specific, some Supabase |

### Legacy Dependency Graph

```
app/_layout.tsx
  └─ trpc.Provider  ←─ lib/trpc.ts  ←─ EXPO_PUBLIC_RORK_API_BASE_URL (broken)

app/(tabs)/coach.tsx
  └─ useRorkAgent / createRorkTool  ←─ @rork-ai/toolkit-sdk (vendor-locked)

app/(tabs)/nutrition.tsx
  └─ generateObject  ←─ @rork-ai/toolkit-sdk (vendor-locked)

metro.config.js
  └─ withRorkMetro  ←─ @rork-ai/toolkit-sdk/metro
```

---

## 2. Target Architecture

```
src/
  utils/
    config.ts        ← Single source of truth for all env vars
  services/
    openai.ts        ← generateObject + chatWithTools (REST calls, no SDK)
  hooks/
    useOpenAICoach.ts ← drop-in replacement for useRorkAgent

lib/
  supabase.ts        ← Supabase client (reads from config.ts)
  remoteFitnessRepo.ts ← Supabase CRUD operations

providers/
  AuthProvider.tsx   ← Supabase Auth state
  FitnessProvider.tsx ← App-wide fitness data state
  LanguageProvider.tsx ← i18n (ar/en)

app/                 ← Expo Router screens (UI only, no business logic)

constants/           ← Colors, translations
data/                ← Static exercise/meal seed data
types/               ← TypeScript interfaces
```

### Dependency Graph (After Refactor)

```
app/_layout.tsx
  └─ QueryClientProvider (tanstack/react-query)

app/(tabs)/coach.tsx
  └─ useOpenAICoach  ←─ src/hooks/useOpenAICoach.ts
       └─ chatWithTools  ←─ src/services/openai.ts  ←─ OpenAI REST API

app/(tabs)/nutrition.tsx
  └─ generateObject  ←─ src/services/openai.ts  ←─ OpenAI REST API

lib/supabase.ts  ←─ src/utils/config.ts  ←─ EXPO_PUBLIC_SUPABASE_*
```

---

## 3. State Management Strategy

| Layer | Technology | Responsibility |
|---|---|---|
| Server state | `@tanstack/react-query` | Remote data caching, refetching |
| Auth state | `AuthProvider` (React Context) | Supabase session |
| Fitness state | `FitnessProvider` (React Context) | Profile, plans, logs |
| UI state | `useState` inside screens | Modals, inputs, loading flags |

---

## 4. Decoupling Plan

### UI ↔ Business Logic

- All API calls are in `src/services/` (no `fetch` calls in screen components).
- All stateful logic is in `src/hooks/` or `providers/`.
- Screen components (`app/`) contain **only** JSX and local UI state.

### Environment

- No credentials are hard-coded; all secrets flow through `EXPO_PUBLIC_*` env vars.
- `src/utils/config.ts` is the single import point for all config values.

---

## 5. Removed Components

| File / Package | Reason |
|---|---|
| `backend/` directory | Rork-generated Hono + tRPC server — not needed for a mobile client |
| `lib/trpc.ts` | Only existed to connect to the Rork backend |
| `@rork-ai/toolkit-sdk` | Vendor-locked; replaced by direct OpenAI REST calls |
| `@hono/trpc-server`, `hono`, `@trpc/*`, `superjson` | Only served the removed backend |
| `@stardazed/streams-text-encoding`, `@ungap/structured-clone`, `react-native-worklets` | Rork SDK polyfills, no longer needed |
