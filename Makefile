.PHONY: dev down logs build test test-watch lint type-check db-fixtures db-reset help

# ── Dev ───────────────────────────────────────────────────────────────────────
# Everything runs in Docker — only Docker required locally.

dev:
	docker compose up

down:
	docker compose down

logs:
	docker compose logs -f app

build:
	docker compose run --rm app sh -c "yarn build"

# ── Tests & linting ───────────────────────────────────────────────────────────
test:
	docker compose run --rm app sh -c "yarn install --frozen-lockfile && yarn test"

test-watch:
	docker compose run --rm -it app sh -c "yarn install --frozen-lockfile && yarn test:watch"

lint:
	docker compose run --rm app sh -c "yarn install --frozen-lockfile && yarn lint"

type-check:
	docker compose run --rm app sh -c "yarn install --frozen-lockfile && yarn type-check"

# ── Database ──────────────────────────────────────────────────────────────────
# Migrations run automatically on `make dev` via the migrate service.
# Fixtures create dev users via GoTrue signup API, then load profile/routine/session data.

db-fixtures:
	@echo "Creating fixture users via GoTrue API (idempotent)..."
	@for name in alice bob carol dave eve; do \
		curl -sf -X POST 'http://localhost:8000/auth/v1/signup' \
			-H 'Content-Type: application/json' \
			-H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqd6X3xu8GY3KlOzWDYIWFzDC3MYIlBRc' \
			-d "{\"email\":\"$${name}@dev.local\",\"password\":\"dev-password-123\"}" > /dev/null 2>&1 || true; \
	done
	@echo "Setting authenticated role for fixture users..."
	@docker compose exec db psql -U postgres -d postgres -c \
		"UPDATE auth.users SET role = 'authenticated' WHERE email LIKE '%@dev.local';" > /dev/null
	@echo "Loading fixture data..."
	@for f in supabase/fixtures/002_profiles.sql supabase/fixtures/003_routines.sql supabase/fixtures/005_sessions.sql supabase/fixtures/006_shares.sql; do \
		echo "  $$f"; \
		docker compose exec db psql -U postgres -d postgres -f /dev/stdin < $$f; \
	done
	@echo "Done. Users: alice/bob/carol/dave/eve — password: dev-password-123"

db-reset:
	docker compose down -v
	docker compose up -d
	@echo "Database reset. Run 'make db-fixtures' to load dev data."

# ── Production ────────────────────────────────────────────────────────────────
prod:
	docker compose -f docker-compose.prod.yml up -d

# ── Help ──────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "Workout Logbook — only Docker required"
	@echo ""
	@echo "  make dev          Start all services (db, auth, rest, gateway, app)"
	@echo "  make down         Stop all services"
	@echo "  make logs         Follow app container logs"
	@echo "  make build        Build for production"
	@echo ""
	@echo "  make test         Run all tests"
	@echo "  make test-watch   Run tests in watch mode"
	@echo "  make lint         Run ESLint + TypeScript check"
	@echo "  make type-check   Run tsc --noEmit"
	@echo ""
	@echo "  make db-fixtures  Create fixture users + load dev data"
	@echo "  make db-reset     Wipe DB volumes and restart fresh"
	@echo ""
	@echo "  make prod         Start in production mode"
	@echo ""
