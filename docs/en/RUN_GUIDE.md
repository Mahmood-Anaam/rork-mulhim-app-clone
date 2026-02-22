# Run Guide - Mulhim App

This guide provides instructions on how to set up and run the Mulhim application locally.

## Prerequisites
- **Node.js**: v18 or later.
- **Bun**: v1.0 or later (recommended for dependency management).
- **Expo CLI**: Installed globally or via `npx`.
- **Supabase Account**: For data persistence.
- **OpenAI API Key**: For the AI Coach feature.

## Environment Setup
Create a `.env` file in the root directory and add the following keys:

```env
EXPO_PUBLIC_OPENAI_API_KEY='your_openai_key'
EXPO_PUBLIC_SUPABASE_URL='your_supabase_url'
EXPO_PUBLIC_SUPABASE_ANON_KEY='your_supabase_anon_key'
```

## Installation
Install the project dependencies using Bun:

```bash
bun install
```

## Running the App
You can run the app using standard Expo commands:

### Start Development Server
```bash
bun run start
```

### Run on iOS Simulator
```bash
bun run ios
```

### Run on Android Emulator
```bash
bun run android
```

### Run on Web
```bash
bun run web
```

## Troubleshooting
- If you encounter bundling errors, try clearing the cache: `bun x expo start --clear`.
- Ensure all environment variables are correctly set in `.env`.
- For Supabase connection issues, verify your project URL and Anon Key.
