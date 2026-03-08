# Workout Logbook

Web app to track workouts: routines, sets, weights, rest timers and progress over time.

**Stack:** React 18 + TypeScript + Vite · Tailwind CSS · Zustand · TanStack Query · Recharts · Supabase (auth, DB, storage) · Vercel

---

## Requirements

- **Docker** (and Docker Compose) — that's it. No Node, Yarn or Supabase CLI needed locally.

---

## Local setup

### 1. Clone

```bash
git clone https://github.com/fabiosanchez-aircury/workout-logbook.git
cd workout-logbook
```

### 2. Start

```bash
make dev
```

This starts the full stack in Docker:

| Service | URL |
|---|---|
| App (Vite) | http://localhost:5173 |
| API gateway | http://localhost:8000 |
| Database | localhost:5432 |

First boot takes a minute — it installs dependencies and runs migrations automatically.

### 3. Load dev data (optional)

```bash
make db-fixtures
```

Creates 5 fixture users with different scenarios:

| User | Password | Scenario |
|---|---|---|
| alice@dev.local | dev-password-123 | New account, no data |
| bob@dev.local | dev-password-123 | Active routine, 3 months of history |
| carol@dev.local | dev-password-123 | Public shared profile |
| dave@dev.local | dev-password-123 | Profile shared in edit mode (coach) |
| eve@dev.local | dev-password-123 | Lots of data, useful for testing charts |

In development, a **Dev Login** panel appears on the login screen to sign in instantly as any of these users.

### 4. Environment variables

The defaults in `docker-compose.yml` work out of the box for local dev (standard Supabase demo keys). If you need to override anything:

```bash
cp .env.example .env
# edit .env as needed
```

---

## Commands

```bash
make dev            # Start all services (db, auth, rest, gateway, app)
make down           # Stop all services
make logs           # Follow app container logs
make build          # Production build

make test           # Run all tests (Vitest)
make test-watch     # Run tests in watch mode
make lint           # ESLint + TypeScript check
make type-check     # tsc --noEmit only

make db-fixtures    # Create fixture users + load dev data
make db-reset       # Wipe DB volumes and restart fresh

make prod           # Start in production mode
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
└── types/          # database.types.ts + models.ts
supabase/
├── init/           # DB init scripts (roles, auth schema) — run on first boot
├── migrations/     # Schema, RLS, seed exercises, storage
├── fixtures/       # Dev seed data
└── gateway.conf    # nginx reverse proxy config
```

---

## How it works locally

The Docker Compose stack replaces the Supabase CLI:

| Container | Image | Purpose |
|---|---|---|
| `db` | postgres:16-alpine | Database with custom role init |
| `auth` | supabase/gotrue | Authentication (email/password, OAuth) |
| `rest` | postgrest/postgrest | Auto-generated REST API |
| `gateway` | nginx:alpine | Reverse proxy on port 8000 |
| `migrate` | postgres:16-alpine | Runs SQL migrations on startup |
| `app` | node:20-alpine | Vite dev server |

---

## Deploy

The app targets **Vercel** (frontend) + **Supabase cloud** (backend), both free tier.

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migrations from `supabase/migrations/` in the Supabase SQL editor
3. Connect the repo to [vercel.com](https://vercel.com) and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## Tests

```bash
make test
```

Covers store logic (`timerStore`, `activeSessionStore`), hooks and utils with Vitest + React Testing Library.
