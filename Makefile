.PHONY: dev build test test-watch lint lint-fix type-check db-push db-types db-fixtures docker-up docker-down docker-logs install clean

# ── Local dev (requires yarn + node >= 20) ──────────────────────────────────
dev:
	yarn dev

build:
	yarn build

test:
	yarn test

test-watch:
	yarn test:watch

test-ui:
	yarn test:ui

lint:
	yarn lint

lint-fix:
	yarn lint:fix

type-check:
	yarn type-check

install:
	yarn install

# ── Docker ───────────────────────────────────────────────────────────────────
docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f app

docker-build:
	docker compose build

docker-prod:
	docker compose -f docker-compose.prod.yml up -d

# Run dev via Docker (all-in-one)
docker-dev:
	docker compose up

# ── Supabase ─────────────────────────────────────────────────────────────────
db-start:
	supabase start

db-stop:
	supabase stop

db-push:
	supabase db push

db-reset:
	supabase db reset

db-types:
	supabase gen types typescript --local > src/types/database.types.ts
	@echo "Types generated at src/types/database.types.ts"

db-fixtures:
	@echo "Loading fixture data..."
	supabase db execute --file supabase/fixtures/001_users.sql
	supabase db execute --file supabase/fixtures/002_profiles.sql
	supabase db execute --file supabase/fixtures/003_routines.sql
	supabase db execute --file supabase/fixtures/005_sessions.sql
	supabase db execute --file supabase/fixtures/006_shares.sql
	@echo "Fixtures loaded."

db-status:
	supabase status

# ── Utilities ────────────────────────────────────────────────────────────────
clean:
	rm -rf dist node_modules .yarn/cache

help:
	@echo ""
	@echo "Workout Logbook — Makefile commands"
	@echo ""
	@echo "  make dev            Start Vite dev server"
	@echo "  make build          Production build"
	@echo "  make test           Run all tests"
	@echo "  make test-watch     Run tests in watch mode"
	@echo "  make lint           Run ESLint + TypeScript check"
	@echo "  make type-check     Run tsc --noEmit"
	@echo "  make install        Install dependencies with yarn"
	@echo ""
	@echo "  make docker-up      Start Docker containers (detached)"
	@echo "  make docker-down    Stop Docker containers"
	@echo "  make docker-dev     Start Docker + follow logs"
	@echo "  make docker-logs    Follow app container logs"
	@echo ""
	@echo "  make db-start       Start Supabase local stack"
	@echo "  make db-push        Push migrations to Supabase"
	@echo "  make db-reset       Reset local DB and re-apply migrations"
	@echo "  make db-types       Generate TypeScript types from schema"
	@echo "  make db-fixtures    Load dev fixture data"
	@echo "  make db-status      Show Supabase local stack status"
	@echo ""
