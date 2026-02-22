# Run Guide — Mulhim App

## Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 18 LTS |
| npm / bun | any recent version |
| Expo CLI | installed globally (`npm i -g expo-cli`) or via `npx expo` |

---

## 1. Clone the Repository

```bash
git clone https://github.com/Mahmood-Anaam/rork-mulhim-app-clone.git
cd rork-mulhim-app-clone
```

---

## 2. Configure Environment Variables

Create a `.env` file in the project root (it is git-ignored):

```bash
cp .env.example .env
```

Then fill in your credentials:

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 3. Install Dependencies

```bash
npm install
# or
bun install
```

---

## 4. Run the App

| Command | Target |
|---|---|
| `npm start` | Expo Dev Server (scan QR with Expo Go) |
| `npm run android` | Android emulator / device |
| `npm run ios` | iOS simulator / device (macOS only) |
| `npm run web` | Browser |

```bash
npm start
```

---

## 5. Lint

```bash
npm run lint
```

---

## Architecture Overview

See [`docs/en/ARCHITECTURE.md`](./ARCHITECTURE.md) for the full data-flow and folder structure documentation.
