# Workout Logbook

Web app to track workouts: routines, sets, weights, rest timers and progress over time.

**Stack:** React 18 + TypeScript + Vite · Supabase (auth, DB, storage) · Tailwind CSS · Zustand · Vercel

---

## Requirements

- Node >= 20
- Yarn (`npm i -g yarn`)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm i -g supabase`)
- Docker (to run Supabase locally)

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/fabiosanchez-aircury/workout-logbook.git
cd workout-logbook
make install
```

### 2. Start Supabase locally

```bash
make db-start
```

This spins up PostgreSQL, Auth and Storage via Docker. Once ready, it prints the local URLs and keys:

```
API URL: http://localhost:54321
anon key: eyJ...
service_role key: eyJ...
```

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with the values from `make db-start` (or `supabase status`):

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_SUPABASE_SERVICE_KEY=<service_role key>   # dev login only
```

### 4. Run migrations

```bash
make db-push
```

### 5. Load fixtures (dev data)

```bash
make db-fixtures
```

Loads 5 users with different scenarios so you can explore the app without signing up.

### 6. Start the app

```bash
make dev
```

Open [http://localhost:5173](http://localhost:5173).

In development, a **Dev Login** panel appears on the login screen to sign in instantly as any fixture user:

| User | Scenario |
|---|---|
| alice | New account, no data |
| bob | Active routine, 3 months of history |
| carol | Public shared profile |
| dave | Profile shared in edit mode (coach) |
| eve | Lots of data, useful for testing charts |

---

## Commands

```bash
make dev            # Start Vite dev server
make build          # Production build
make test           # Run all tests
make test-watch     # Run tests in watch mode
make lint           # ESLint + TypeScript check

make db-start       # Start local Supabase stack (Docker)
make db-stop        # Stop local Supabase stack
make db-push        # Apply migrations
make db-reset       # Reset DB and re-apply migrations
make db-fixtures    # Load dev fixture data
make db-types       # Regenerate TypeScript types from schema

make docker-up      # Start app in Docker (detached)
make docker-down    # Stop containers
make docker-dev     # Start app in Docker with logs
make docker-prod    # Start in production mode
```

---

## Project structure

```
src/
├── components/
│   ├── auth/       # AuthGuard, DevQuickLogin
│   ├── layout/     # AppShell, BottomNav, Sidebar, TopBar
│   ├── ui/         # Button, Input, Card, Modal, Badge...
│   ├── routine/    # RoutineCard, RoutineForm, ExerciseSelector...
│   ├── workout/    # ExerciseLogger, SetRow, RestTimer...
│   ├── charts/     # VolumeChart, StrengthProgressChart...
│   └── profile/    # ProfileHeader, ShareProfilePanel...
├── hooks/          # useAuth, useRoutines, useRestTimer, useChartData...
├── lib/            # Supabase client, queryClient, utils
├── pages/          # One component per route
├── services/       # Supabase data access logic
├── stores/         # Zustand: authStore, activeSessionStore, timerStore
└── types/          # database.types.ts (generated) + models.ts
supabase/
├── migrations/     # Schema, RLS, seed exercises, storage
└── fixtures/       # Dev seed data
```

---

## Deploy

The app is designed to run on **Vercel** + **Supabase cloud** (both free tier).

1. Create a project at [supabase.com](https://supabase.com)
2. Run `make db-push` pointing to the remote project
3. Enable Google OAuth in Supabase Dashboard → Authentication → Providers
4. Connect the repo to [vercel.com](https://vercel.com) and add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## Tests

```bash
make test
```

Covers store logic (`timerStore`, `activeSessionStore`), hooks and utils with Vitest + React Testing Library.
